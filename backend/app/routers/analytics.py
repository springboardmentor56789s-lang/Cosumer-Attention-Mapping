from datetime import datetime, timezone
from pathlib import Path
from types import SimpleNamespace
from typing import List
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from database.database import get_db
from app import model
from app.dependencies import get_current_user
from app.schemas.analytics import AnalyticsSummary, DetectionCreate, DetectionResponse
from app.services.video_preprocessing_service import FFmpegUnavailableError, VideoPreprocessingError, VideoPreprocessingService
from app.services.video_pipeline_service import VideoPipelineService
from app.services.yolo_service import YOLOService

router = APIRouter(prefix="/analytics", tags=["Analytics"])
yolo_service = YOLOService()
video_pipeline_service = VideoPipelineService()
video_preprocessing_service = VideoPreprocessingService()


@router.get("/video/runs", status_code=status.HTTP_200_OK)
def get_recent_video_runs(limit: int = 20, db: Session = Depends(get_db)):
    limit = max(1, min(limit, 100))

    recent_heatmaps = (
        db.query(model.Heatmap)
        .filter(model.Heatmap.heatmap_type == "movement")
        .order_by(model.Heatmap.created_at.desc())
        .limit(limit * 3)
        .all()
    )

    rows = []
    for heatmap in recent_heatmaps:
        coordinates = heatmap.coordinates or {}
        artifacts = coordinates.get("artifacts", {}) if isinstance(coordinates, dict) else {}
        summary = coordinates.get("summary", {}) if isinstance(coordinates, dict) else {}

        annotated_url = _to_upload_url(artifacts.get("annotated_video_path"))
        heatmap_url = _to_upload_url(artifacts.get("heatmap_image_path"))

        if not annotated_url:
            continue

        camera = db.query(model.Camera).filter(model.Camera.id == heatmap.camera_id).first()
        video_file = Path(annotated_url).name

        rows.append(
            {
                "camera_id": heatmap.camera_id,
                "store_id": heatmap.store_id,
                "video_file": video_file,
                "video_url": annotated_url,
                "uploaded_at": heatmap.created_at.isoformat() if heatmap.created_at else None,
                "status": camera.processing_status if camera else "Idle",
                "analytics_rows": int(summary.get("processed_frames", 0) or 0),
                "avg_attention_score": float(summary.get("avg_attention_score", 0.0) or 0.0),
                "avg_dwell_time": float(summary.get("avg_dwell_time", 0.0) or 0.0),
                "heatmap_url": heatmap_url,
                "unique_customers": int(summary.get("unique_customers", 0) or 0),
                "peak_customers": int(summary.get("peak_customers", 0) or 0),
                "total_product_detections": int(summary.get("total_product_detections", 0) or 0),
            }
        )

        if len(rows) >= limit:
            break

    return {"items": rows}


@router.post("/detect", response_model=DetectionResponse, status_code=status.HTTP_201_CREATED)
def save_detection(payload: DetectionCreate, db: Session = Depends(get_db)):
    camera = db.query(model.Camera).filter(model.Camera.id == payload.camera_id).first()
    store = db.query(model.Store).filter(model.Store.id == payload.store_id).first()

    if not camera or not store:
        raise HTTPException(status_code=404, detail="Camera or store not found")

    detection = model.Detection(
        camera_id=payload.camera_id,
        store_id=payload.store_id,
        shelf_id=payload.shelf_id,
        zone_id=payload.zone_id,
        track_id=payload.track_id,
        detected_class=payload.detected_class,
        confidence=payload.confidence,
        bbox_x=payload.bbox_x,
        bbox_y=payload.bbox_y,
        bbox_w=payload.bbox_w,
        bbox_h=payload.bbox_h,
    )

    db.add(detection)
    db.commit()
    db.refresh(detection)
    return detection


@router.get("/recent", response_model=List[DetectionResponse])
def get_recent_detections(db: Session = Depends(get_db)):
    detections = db.query(model.Detection).order_by(model.Detection.created_at.desc()).limit(20).all()
    return detections


@router.get("/summary", response_model=AnalyticsSummary)
def get_summary(db: Session = Depends(get_db)):
    total_detections = db.query(model.Detection).count()
    recent_rows = db.query(model.Detection).order_by(model.Detection.created_at.desc()).limit(10).all()
    recent_classes = [row.detected_class for row in recent_rows]
    return AnalyticsSummary(total_detections=total_detections, recent_classes=recent_classes)


@router.post("/run", status_code=status.HTTP_200_OK)
def run_detection_for_camera(camera_id: int, db: Session = Depends(get_db)):
    camera = db.query(model.Camera).filter(model.Camera.id == camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")

    if not camera.rtsp_url:
        raise HTTPException(status_code=400, detail="Camera RTSP URL is missing")

    detections = yolo_service.process_rtsp_url(camera.rtsp_url)
    video_pipeline_service._enrich_detections(
        camera, detections, {}, video_pipeline_service._camera_zones(db, camera.id)
    )
    return {"camera_id": camera_id, "detections": detections}


@router.post("/video/analyze", status_code=status.HTTP_200_OK)
async def analyze_uploaded_video(
    store_id: int = Form(...),
    video_file: UploadFile = File(...),
    camera_id: int | None = Form(None),
    max_frames: int = Form(120),
    conf_threshold: float = Form(0.25),
    db: Session = Depends(get_db),
    current_user: model.User = Depends(get_current_user),
):
    store = db.query(model.Store).filter(model.Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")

    suffix = Path(video_file.filename or "upload.mp4").suffix.lower() or ".mp4"
    if suffix not in {".mp4", ".avi", ".mov", ".mkv"}:
        raise HTTPException(status_code=400, detail="Unsupported video format. Use mp4/avi/mov/mkv")

    uploads_dir = Path(__file__).resolve().parents[2] / "uploads"
    uploads_dir.mkdir(parents=True, exist_ok=True)
    saved_name = f"{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}_{uuid4().hex[:8]}{suffix}"
    saved_path = uploads_dir / saved_name
    annotated_name = f"annotated_{saved_name}"
    annotated_path = uploads_dir / annotated_name

    with saved_path.open("wb") as output:
        output.write(await video_file.read())

    try:
        processed_path = video_preprocessing_service.preprocess(saved_path, uploads_dir)
    except FFmpegUnavailableError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    except VideoPreprocessingError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error

    base_camera = None
    if camera_id is not None:
        base_camera = (
            db.query(model.Camera)
            .filter(model.Camera.id == camera_id, model.Camera.store_id == store_id)
            .first()
        )
        if not base_camera:
            raise HTTPException(status_code=404, detail="Provided camera_id not found for this store")
    else:
        base_camera = (
            db.query(model.Camera)
            .filter(model.Camera.store_id == store_id)
            .order_by(model.Camera.id.asc())
            .first()
        )
        if not base_camera:
            raise HTTPException(
                status_code=400,
                detail="No camera found for this store. Add at least one camera or pass camera_id.",
            )

    # Do not insert uploaded videos into camera database.
    # Build a runtime-only camera-like object for processing the uploaded file,
    # while reusing an existing camera_id for FK-linked records.
    runtime_camera = SimpleNamespace(
        id=base_camera.id,
        store_id=store_id,
        rtsp_url=str(processed_path),
        location="Uploaded Video",
        status="Online",
        camera_type="video",
        video_path=str(processed_path),
        processing_status="Running",
        current_detection_status="Detecting",
        fps=float(base_camera.fps or 0.0),
        last_active_at=base_camera.last_active_at,
        calibration_points=base_camera.calibration_points or {},
        homography_matrix=base_camera.homography_matrix or [],
        blueprint_polygon_zones=base_camera.blueprint_polygon_zones or [],
        blueprint_url=base_camera.blueprint_url or store.blueprint_url,
        blueprint_width=base_camera.blueprint_width or store.blueprint_width or 0,
        blueprint_height=base_camera.blueprint_height or store.blueprint_height or 0,
    )

    started_at = datetime.now(timezone.utc)
    result = video_pipeline_service.analyze_camera(
        db,
        runtime_camera,
        max_frames=max(1, min(max_frames, 5000)),
        conf_threshold=max(0.01, min(conf_threshold, 1.0)),
        process_all_frames=True,
        output_video_path=str(annotated_path),
    )

    run_tracks = (
        db.query(model.CustomerTrack)
        .filter(model.CustomerTrack.camera_id == runtime_camera.id, model.CustomerTrack.entry_time >= started_at)
        .order_by(model.CustomerTrack.id.asc())
        .all()
    )

    # Fallback for clock/timezone drift between app time and DB server time.
    # When pipeline confirms saved tracks but started_at filter returns no rows,
    # use the most recent rows for this camera to build KPI/charts.
    if not run_tracks and int(result.get("customer_tracks_saved", 0) or 0) > 0:
        limit_rows = int(result.get("customer_tracks_saved", 0) or 0)
        run_tracks = (
            db.query(model.CustomerTrack)
            .filter(model.CustomerTrack.camera_id == runtime_camera.id)
            .order_by(model.CustomerTrack.id.desc())
            .limit(limit_rows)
            .all()
        )
        run_tracks.reverse()

    # Keep analytics row count for compatibility, but source KPI series from customer tracks.
    run_rows = (
        db.query(model.Analytics)
        .filter(model.Analytics.camera_id == runtime_camera.id, model.Analytics.visit_time >= started_at)
        .order_by(model.Analytics.id.asc())
        .all()
    )

    if not run_rows and int(result.get("analytics_saved", 0) or 0) > 0:
        limit_rows = int(result.get("analytics_saved", 0) or 0)
        run_rows = (
            db.query(model.Analytics)
            .filter(model.Analytics.camera_id == runtime_camera.id)
            .order_by(model.Analytics.id.desc())
            .limit(limit_rows)
            .all()
        )
        run_rows.reverse()

    run_detections = []
    detection_limit = int(result.get("detection_rows_saved", 0) or 0)
    if detection_limit:
        run_detections = (
            db.query(model.Detection)
            .filter(model.Detection.camera_id == runtime_camera.id)
            .order_by(model.Detection.id.desc())
            .limit(detection_limit)
            .all()
        )

    attention_series = [round(float(row.attention_score or 0.0), 2) for row in run_tracks]
    dwell_series = [round(float(row.dwell_time or 0.0), 2) for row in run_tracks]
    frame_labels = [f"F{i + 1}" for i in range(len(run_tracks))]

    avg_attention = round(sum(attention_series) / len(attention_series), 2) if attention_series else 0.0
    max_attention = round(max(attention_series), 2) if attention_series else 0.0
    avg_dwell = round(sum(dwell_series) / len(dwell_series), 2) if dwell_series else 0.0

    records = len(run_tracks)
    pipeline_processed = int(result.get("processed_frames", 0) or 0)
    pipeline_saved = int(result.get("analytics_saved", 0) or 0)
    tracks_saved = int(result.get("customer_tracks_saved", 0) or 0)

    source_video_url = f"/uploads/{saved_name}"
    annotated_video_url = _to_upload_url(result.get("annotated_video_path")) or source_video_url
    heatmap_url = _to_upload_url(result.get("heatmap_image_path"))

    metrics = {
        "records": records,
        "processed_frames": pipeline_processed,
        "analytics_saved": pipeline_saved,
        "customer_tracks_saved": tracks_saved,
        "detections_saved": int(result.get("detection_rows_saved", 0) or 0),
        "unique_customers": int(result.get("unique_customers", 0) or 0),
        "peak_customers": int(result.get("peak_customers", 0) or 0),
        "total_product_detections": int(result.get("total_product_detections", 0) or 0),
        "avg_attention_score": avg_attention,
        "max_attention_score": max_attention,
        "avg_dwell_time": avg_dwell,
    }
    charts = {
        "labels": frame_labels,
        "attention_series": attention_series,
        "dwell_series": dwell_series,
    }

    trajectory_url = f"/api/blueprint/videos/trajectory?video_id={str(saved_path)}"
    return {
        "reports": [],
        "dynamic_report_types": [
            "consumer_attention",
            "product_engagement",
            "shelf_performance",
            "conversion",
            "marketing_effectiveness",
        ],
        "camera_id": runtime_camera.id,
        "video_id": str(saved_path),
        "video_file": saved_name,
        "processed_video_file": processed_path.name,
        "video_url": annotated_video_url,
        "source_video_url": source_video_url,
        "trajectory_url": trajectory_url,
        "heatmap_url": heatmap_url,
        "store_id": store_id,
        "pipeline": result,
        "metrics": metrics,
        "charts": charts,
    }


def _to_upload_url(path_value: str | None) -> str | None:
    if not path_value:
        return None
    file_name = Path(path_value).name
    return f"/uploads/{file_name}" if file_name else None
