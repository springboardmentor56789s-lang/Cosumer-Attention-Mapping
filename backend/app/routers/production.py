import csv
import io
from collections import Counter
from datetime import datetime, time, timezone
from pathlib import Path
from typing import Any, Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, Query, Request, Response, UploadFile, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app import model
from app.dependencies import require_admin
from app.auth import decode_access_token
from app.repositories.production_repository import ProductionRepository
from app.schemas.production import (
    AnalyticsCreate,
    AnalyticsResponse,
    CameraCreate,
    CameraResponse,
    CameraUpdate,
    CameraZoneCreate,
    CameraZoneResponse,
    CameraZoneUpdate,
    CustomerTrackCreate,
    CustomerTrackResponse,
    HeatmapCreate,
    HeatmapResponse,
    ProductCreate,
    ProductResponse,
    ProductUpdate,
    ReportCreate,
    ReportResponse,
    SettingCreate,
    SettingResponse,
    ShelfCreate,
    ShelfResponse,
    ShelfUpdate,
    ZoneShelfCreate,
    ZoneShelfUpdate,
    StoreCreate,
    StoreResponse,
    StoreUpdate,
)
from app.services.production_service import ProductionAnalyticsService
from app.services.video_pipeline_service import VideoPipelineService
from database.database import get_db
from app.services.report_data_services import SUPPORTED_REPORT_TYPES, get_dynamic_report_data

router = APIRouter(prefix="/api/production", tags=["Production Operations"])
service = ProductionAnalyticsService()
pipeline_service = VideoPipelineService()


@router.get("/dashboard/overview")
def get_dashboard_overview(db: Session = Depends(get_db)):
    return service.get_dashboard_summary(db)


@router.get("/dashboard/series")
def get_dashboard_series(db: Session = Depends(get_db)):
    return service.get_dashboard_series(db)


@router.get("/analytics/live")
def get_live_analytics(db: Session = Depends(get_db)):
    summary = service.get_dashboard_summary(db)
    series = service.get_dashboard_series(db)
    return {"summary": summary, "series": series}


@router.post("/analytics/record", response_model=AnalyticsResponse, status_code=status.HTTP_201_CREATED)
def create_analytics_record(payload: AnalyticsCreate, db: Session = Depends(get_db)):
    repo = ProductionRepository(db)
    return repo.create_analytics(payload.model_dump())


@router.post("/customer-tracks", response_model=CustomerTrackResponse, status_code=status.HTTP_201_CREATED)
def create_customer_track(payload: CustomerTrackCreate, db: Session = Depends(get_db)):
    repo = ProductionRepository(db)
    return repo.create_customer_track(payload.model_dump())


@router.get("/stores", response_model=list[StoreResponse])
def list_stores(
    db: Session = Depends(get_db),
    admin_user: model.User = Depends(require_admin),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=200),
    search: Optional[str] = Query(default=None),
):
    query = db.query(model.Store).filter(model.Store.is_live_store.is_(True))
    if search:
        query = query.filter(model.Store.store_name.ilike(f"%{search}%"))
    return query.order_by(model.Store.store_name).offset((page - 1) * page_size).limit(page_size).all()


@router.post("/stores", response_model=StoreResponse, status_code=status.HTTP_201_CREATED)
def create_store(payload: StoreCreate, db: Session = Depends(get_db), admin_user: model.User = Depends(require_admin)):
    repo = ProductionRepository(db)
    return repo.create_store(payload.model_dump())


@router.put("/stores/{store_id}", response_model=StoreResponse)
def update_store(store_id: int, payload: StoreUpdate, db: Session = Depends(get_db), admin_user: model.User = Depends(require_admin)):
    store = db.query(model.Store).filter(model.Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(store, key, value)
    db.commit()
    db.refresh(store)
    return store


@router.delete("/stores/{store_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_store(store_id: int, db: Session = Depends(get_db), admin_user: model.User = Depends(require_admin)):
    store = db.query(model.Store).filter(model.Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    db.delete(store)
    db.commit()


@router.get("/shelves", response_model=list[ShelfResponse])
def list_shelves(
    db: Session = Depends(get_db),
    admin_user: model.User = Depends(require_admin),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=200),
    store_id: Optional[int] = Query(default=None),
):
    query = db.query(model.Shelf)
    if store_id is not None:
        query = query.filter(model.Shelf.store_id == store_id)
    return query.order_by(model.Shelf.shelf_name).offset((page - 1) * page_size).limit(page_size).all()


@router.post("/shelves", response_model=ShelfResponse, status_code=status.HTTP_201_CREATED)
def create_shelf(payload: ShelfCreate, db: Session = Depends(get_db), admin_user: model.User = Depends(require_admin)):
    repo = ProductionRepository(db)
    return repo.create_shelf(payload.model_dump())


@router.put("/shelves/{shelf_id}", response_model=ShelfResponse)
def update_shelf(shelf_id: int, payload: ShelfUpdate, db: Session = Depends(get_db), admin_user: model.User = Depends(require_admin)):
    shelf = db.query(model.Shelf).filter(model.Shelf.id == shelf_id).first()
    if not shelf:
        raise HTTPException(status_code=404, detail="Shelf not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(shelf, key, value)
    db.commit()
    db.refresh(shelf)
    return shelf


@router.delete("/shelves/{shelf_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_shelf(shelf_id: int, db: Session = Depends(get_db), admin_user: model.User = Depends(require_admin)):
    shelf = db.query(model.Shelf).filter(model.Shelf.id == shelf_id).first()
    if not shelf:
        raise HTTPException(status_code=404, detail="Shelf not found")
    db.delete(shelf)
    db.commit()


@router.get("/products", response_model=list[ProductResponse])
def list_products(
    db: Session = Depends(get_db),
    admin_user: model.User = Depends(require_admin),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=200),
    search: Optional[str] = Query(default=None),
):
    query = db.query(model.Product)
    if search:
        query = query.filter(model.Product.name.ilike(f"%{search}%"))
    return query.order_by(model.Product.name).offset((page - 1) * page_size).limit(page_size).all()


@router.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(payload: ProductCreate, db: Session = Depends(get_db), admin_user: model.User = Depends(require_admin)):
    repo = ProductionRepository(db)
    return repo.create_product(payload.model_dump())


@router.put("/products/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db), admin_user: model.User = Depends(require_admin)):
    product = db.query(model.Product).filter(model.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(product, key, value)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db), admin_user: model.User = Depends(require_admin)):
    product = db.query(model.Product).filter(model.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()


@router.get("/cameras", response_model=list[CameraResponse])
def list_cameras(
    db: Session = Depends(get_db),
    admin_user: model.User = Depends(require_admin),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=200),
    store_id: Optional[int] = Query(default=None),
    status_filter: Optional[str] = Query(default=None, alias="status"),
):
    query = db.query(model.Camera)
    if store_id is not None:
        query = query.filter(model.Camera.store_id == store_id)
    if status_filter:
        query = query.filter(model.Camera.status == status_filter)
    return query.order_by(model.Camera.camera_name).offset((page - 1) * page_size).limit(page_size).all()


def _zone_hierarchy(camera: model.Camera) -> list[dict[str, Any]]:
    return [
        {
            "id": zone.id,
            "camera_id": zone.camera_id,
            "zone_name": zone.zone_name,
            "zone_code": zone.zone_code,
            "roi": zone.roi,
            "shelves": [
                {"id": shelf.id, "shelf_name": shelf.shelf_name, "shelf_number": shelf.shelf_number, "roi": shelf.roi}
                for shelf in zone.shelves
            ],
        }
        for zone in camera.zones
    ]


@router.get("/cameras/{camera_id}/zones")
def get_camera_zones(camera_id: int, db: Session = Depends(get_db), admin_user: model.User = Depends(require_admin)):
    camera = db.query(model.Camera).filter(model.Camera.id == camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    return {"camera_id": camera.id, "zones": _zone_hierarchy(camera)}


@router.post("/cameras/{camera_id}/reference-video", response_model=CameraResponse)
async def upload_camera_reference_video(
    camera_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin_user: model.User = Depends(require_admin),
):
    camera = db.query(model.Camera).filter(model.Camera.id == camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")

    suffix = Path(file.filename or "reference.mp4").suffix.lower()
    if suffix not in {".mp4", ".avi", ".mov", ".mkv"}:
        raise HTTPException(status_code=400, detail="Unsupported reference video format. Use mp4, avi, mov, or mkv")

    uploads_dir = Path(__file__).resolve().parents[2] / "uploads"
    uploads_dir.mkdir(parents=True, exist_ok=True)
    saved_path = uploads_dir / f"camera_{camera_id}_reference_{uuid4().hex[:8]}{suffix}"
    with saved_path.open("wb") as output:
        output.write(await file.read())

    camera.video_path = str(saved_path)
    camera.camera_type = "video"
    camera.rtsp_url = str(saved_path)
    db.commit()
    db.refresh(camera)
    return camera


@router.get("/cameras/{camera_id}/reference-frame")
def get_camera_reference_frame(
    camera_id: int,
    timestamp_seconds: float = Query(default=0.0, ge=0.0),
    db: Session = Depends(get_db),
    admin_user: model.User = Depends(require_admin),
):
    camera = db.query(model.Camera).filter(model.Camera.id == camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    if camera.camera_type != "video" or not camera.video_path:
        raise HTTPException(status_code=400, detail="Assign a recorded video to this camera before configuring ROIs")

    try:
        frame, _fps = pipeline_service.capture_frame_at(camera, timestamp_seconds)
        import cv2
        encoded, image = cv2.imencode(".jpg", frame)
        if not encoded:
            raise RuntimeError("Unable to encode reference frame")
        height, width = frame.shape[:2]
        return Response(
            content=image.tobytes(),
            media_type="image/jpeg",
            headers={"X-Reference-Frame-Width": str(width), "X-Reference-Frame-Height": str(height)},
        )
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Unable to extract reference frame: {exc}") from exc


@router.post("/cameras/{camera_id}/zones", response_model=CameraZoneResponse, status_code=status.HTTP_201_CREATED)
def create_camera_zone(camera_id: int, payload: CameraZoneCreate, db: Session = Depends(get_db), admin_user: model.User = Depends(require_admin)):
    camera = db.query(model.Camera).filter(model.Camera.id == camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    fields = payload.model_dump(exclude={"roi"})
    zone = model.CameraZone(camera_id=camera_id, **fields)
    db.add(zone)
    db.flush()
    roi_entry = model.CameraZoneROI(camera_id=camera_id, zone_id=zone.id, polygon_coordinates=payload.roi.model_dump())
    db.add(roi_entry)
    db.commit()
    db.refresh(zone)
    return zone


@router.put("/cameras/{camera_id}/zones/{zone_id}", response_model=CameraZoneResponse)
def update_camera_zone(camera_id: int, zone_id: int, payload: CameraZoneUpdate, db: Session = Depends(get_db), admin_user: model.User = Depends(require_admin)):
    zone = db.query(model.CameraZone).filter(model.CameraZone.id == zone_id, model.CameraZone.camera_id == camera_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found for this camera")
    updates = payload.model_dump(exclude_unset=True, exclude={"roi"})
    for key, value in updates.items():
        setattr(zone, key, value)
    if payload.roi is not None:
        if zone.roi_entry is None:
            zone.roi_entry = model.CameraZoneROI(camera_id=camera_id, zone_id=zone.id, polygon_coordinates=payload.roi.model_dump())
        else:
            zone.roi_entry.polygon_coordinates = payload.roi.model_dump()
    db.commit(); db.refresh(zone)
    return zone


@router.delete("/cameras/{camera_id}/zones/{zone_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_camera_zone(camera_id: int, zone_id: int, db: Session = Depends(get_db), admin_user: model.User = Depends(require_admin)):
    zone = db.query(model.CameraZone).filter(model.CameraZone.id == zone_id, model.CameraZone.camera_id == camera_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found for this camera")
    db.delete(zone); db.commit()


@router.post("/cameras/{camera_id}/zones/{zone_id}/shelves", status_code=status.HTTP_201_CREATED)
def create_zone_shelf(camera_id: int, zone_id: int, payload: ZoneShelfCreate, db: Session = Depends(get_db), admin_user: model.User = Depends(require_admin)):
    zone = db.query(model.CameraZone).filter(model.CameraZone.id == zone_id, model.CameraZone.camera_id == camera_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found for this camera")
    existing = db.query(model.Shelf).filter(model.Shelf.shelf_number == payload.shelf_number).first()
    if existing:
        raise HTTPException(status_code=409, detail="Shelf ID already exists")
    fields = payload.model_dump(exclude={"roi"})
    shelf = model.Shelf(store_id=zone.camera.store_id, zone_id=zone.id, **fields)
    db.add(shelf)
    db.flush()
    roi_entry = model.CameraShelfROI(camera_id=camera_id, shelf_id=shelf.id, polygon_coordinates=payload.roi.model_dump())
    db.add(roi_entry)
    db.commit(); db.refresh(shelf)
    return {"id": shelf.id, "shelf_name": shelf.shelf_name, "shelf_number": shelf.shelf_number, "roi": shelf.roi, "zone_id": zone.id}


@router.put("/cameras/{camera_id}/zones/{zone_id}/shelves/{shelf_id}")
def update_zone_shelf(camera_id: int, zone_id: int, shelf_id: int, payload: ZoneShelfUpdate, db: Session = Depends(get_db), admin_user: model.User = Depends(require_admin)):
    shelf = db.query(model.Shelf).join(model.CameraZone).filter(model.Shelf.id == shelf_id, model.Shelf.zone_id == zone_id, model.CameraZone.camera_id == camera_id).first()
    if not shelf:
        raise HTTPException(status_code=404, detail="Shelf not found for this zone")
    updates = payload.model_dump(exclude_unset=True, exclude={"roi"})
    for key, value in updates.items():
        setattr(shelf, key, value)
    if payload.roi is not None:
        if shelf.roi_entry is None:
            shelf.roi_entry = model.CameraShelfROI(camera_id=camera_id, shelf_id=shelf.id, polygon_coordinates=payload.roi.model_dump())
        else:
            shelf.roi_entry.polygon_coordinates = payload.roi.model_dump()
    db.commit(); db.refresh(shelf)
    return {"id": shelf.id, "shelf_name": shelf.shelf_name, "shelf_number": shelf.shelf_number, "roi": shelf.roi, "zone_id": zone_id}


@router.delete("/cameras/{camera_id}/zones/{zone_id}/shelves/{shelf_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_zone_shelf(camera_id: int, zone_id: int, shelf_id: int, db: Session = Depends(get_db), admin_user: model.User = Depends(require_admin)):
    shelf = db.query(model.Shelf).join(model.CameraZone).filter(model.Shelf.id == shelf_id, model.Shelf.zone_id == zone_id, model.CameraZone.camera_id == camera_id).first()
    if not shelf:
        raise HTTPException(status_code=404, detail="Shelf not found for this zone")
    db.delete(shelf); db.commit()


@router.post("/cameras", response_model=CameraResponse, status_code=status.HTTP_201_CREATED)
def create_camera(payload: CameraCreate, db: Session = Depends(get_db), admin_user: model.User = Depends(require_admin)):
    repo = ProductionRepository(db)
    return repo.create_camera(payload.model_dump())


@router.put("/cameras/{camera_id}", response_model=CameraResponse)
def update_camera(camera_id: int, payload: CameraUpdate, db: Session = Depends(get_db), admin_user: model.User = Depends(require_admin)):
    camera = db.query(model.Camera).filter(model.Camera.id == camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(camera, key, value)
    db.commit()
    db.refresh(camera)
    return camera


@router.post("/cameras/{camera_id}/start")
def start_camera(camera_id: int, db: Session = Depends(get_db), admin_user: model.User = Depends(require_admin)):
    camera = db.query(model.Camera).filter(model.Camera.id == camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    camera.status = "Online"
    camera.processing_status = "Running"
    camera.current_detection_status = "Detecting"
    db.commit()
    return pipeline_service.get_camera_status(camera, is_streaming=True)


@router.get("/cameras/{camera_id}/status")
def camera_status(camera_id: int, db: Session = Depends(get_db), admin_user: model.User = Depends(require_admin)):
    camera = db.query(model.Camera).filter(model.Camera.id == camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    return pipeline_service.get_camera_status(camera)


@router.get("/cameras/{camera_id}/preview")
def preview_camera(camera_id: int, db: Session = Depends(get_db), admin_user: model.User = Depends(require_admin)):
    camera = db.query(model.Camera).filter(model.Camera.id == camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")

    try:
        payload = pipeline_service.preview_camera(camera, db=db)
        camera.last_active_at = datetime.now(timezone.utc)
        camera.fps = payload.get("fps", camera.fps)
        camera.current_detection_status = "Preview"
        db.commit()
        payload["status"] = pipeline_service.get_camera_status(
            camera,
            is_streaming=True,
            frame_shape=payload.get("frame_shape"),
            total_detections=payload.get("total_detections"),
        )
        return payload
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Preview failed: {exc}")

@router.post("/cameras/{camera_id}/analyze")
def analyze_camera(
    camera_id: int,
    max_frames: int = Query(default=120, ge=1),
    conf_threshold: float = Query(default=0.25, ge=0.0, le=1.0),
    db: Session = Depends(get_db),
    admin_user: model.User = Depends(require_admin),
):
    """
    Analyze the video associated with a camera.

    After successful video analysis, the video pipeline automatically creates
    Consumer Attention, Product Engagement, Shelf Performance, Conversion,
    and Marketing Effectiveness reports.
    """

    # --------------------------------------------------------
    # Find camera
    # --------------------------------------------------------

    camera = (
        db.query(model.Camera)
        .filter(model.Camera.id == camera_id)
        .first()
    )

    if not camera:
        raise HTTPException(
            status_code=404,
            detail="Camera not found",
        )

    # --------------------------------------------------------
    # Mark camera as running
    # --------------------------------------------------------

    camera.status = "Running"
    db.commit()

    # --------------------------------------------------------
    # Run video analysis
    # --------------------------------------------------------

    try:
        pipeline_service = VideoPipelineService()

        result = pipeline_service.analyze_camera(
            db=db,
            camera=camera,
            max_frames=max_frames,
            conf_threshold=conf_threshold,

            # IMPORTANT:
            # Pass the logged-in user's ID to the pipeline.
            user_id=admin_user.id,
        )

        return result

    except Exception as exc:

        camera.status = "Error"
        db.commit()

        raise HTTPException(
            status_code=500,
            detail=f"Video analysis failed: {exc}",
        )

@router.get("/cameras/{camera_id}/stream")
def stream_camera(
    camera_id: int,
    token: Optional[str] = Query(default=None),
    request: Request = None,
    db: Session = Depends(get_db),
):
    # Native <img> elements cannot attach Authorization headers.  Preserve
    # bearer authentication and additionally accept the existing query-token
    # stream URL used by the camera UI.
    bearer = request.headers.get("Authorization", "") if request else ""
    supplied_token = token or (bearer.split(" ", 1)[1] if bearer.lower().startswith("bearer ") else None)
    payload = decode_access_token(supplied_token) if supplied_token else None
    email = payload.get("sub") if payload else None
    admin_user = db.query(model.User).filter(model.User.email == email).first() if email else None
    if not admin_user or admin_user.role != model.UserRole.ADMIN:
        raise HTTPException(status_code=401, detail="Not authenticated")
    camera = db.query(model.Camera).filter(model.Camera.id == camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")

    try:
        camera.status = "Online"
        camera.processing_status = "Streaming"
        camera.current_detection_status = "Live"
        db.commit()
        return StreamingResponse(
            pipeline_service.iter_stream_frames(camera, db=db),
            media_type="multipart/x-mixed-replace; boundary=frame",
        )
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Stream failed: {exc}")


@router.post("/cameras/{camera_id}/stop")
def stop_camera(camera_id: int, db: Session = Depends(get_db), admin_user: model.User = Depends(require_admin)):
    camera = db.query(model.Camera).filter(model.Camera.id == camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    camera.status = "Offline"
    camera.processing_status = "Stopped"
    camera.current_detection_status = "Idle"
    db.commit()
    return pipeline_service.get_camera_status(camera, is_streaming=False)


@router.delete("/cameras/{camera_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_camera(camera_id: int, db: Session = Depends(get_db), admin_user: model.User = Depends(require_admin)):
    camera = db.query(model.Camera).filter(model.Camera.id == camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    db.delete(camera)
    db.commit()


@router.get("/heatmaps", response_model=list[HeatmapResponse])
def list_heatmaps(db: Session = Depends(get_db), admin_user: model.User = Depends(require_admin)):
    return service.get_heatmap_payload(db)


@router.post("/heatmaps", response_model=HeatmapResponse, status_code=status.HTTP_201_CREATED)
def create_heatmap(payload: HeatmapCreate, db: Session = Depends(get_db), admin_user: model.User = Depends(require_admin)):
    repo = ProductionRepository(db)
    return repo.create_heatmap(payload.model_dump())


REPORT_CATALOG = (
    ("consumer_attention", "Consumer Attention Report"),
    ("product_engagement", "Product Engagement Report"),
    ("shelf_performance", "Shelf Performance Report"),
    ("conversion", "Conversion Report"),
    ("marketing_effectiveness", "Marketing Effectiveness Report"),
)


def _report_payload(report: model.Report) -> dict[str, Any]:
    """Keep the established fields and expose the dashboard's field aliases."""
    filters = _report_filters(report)
    store_name = report.store.store_name if report.store else None
    return {
        "id": report.id,
        "report_id": report.report_id,
        "store_id": report.store_id,
        "store_name": store_name,
        "report_name": report.report_name,
        "report_type": report.report_type,
        "filters": filters,
        "filter": filters,
        "file_path": report.file_path,
        "video_path": report.file_path,
        "created_by": report.created_by,
        "created_at": report.created_at,
    }


def _filter_analytics(query, filters: dict[str, Any], store_id: Optional[int]):
    analytics_ids = filters.get("analytics_ids")
    if isinstance(analytics_ids, list):
        valid_ids = [int(value) for value in analytics_ids if str(value).isdigit()]
        # An upload with no confirmed tracks deliberately has no analytics rows.
        return query.filter(model.Analytics.id.in_(valid_ids)) if valid_ids else query.filter(model.Analytics.id == -1)
    effective_store_id = store_id or filters.get("store_id")
    if effective_store_id is not None:
        query = query.filter(model.Analytics.store_id == int(effective_store_id))
    for key, comparison in (("from_date", ">="), ("to_date", "<=")):
        value = filters.get(key)
        if not value:
            continue
        try:
            parsed = datetime.fromisoformat(str(value)).date()
            boundary = datetime.combine(parsed, time.min if comparison == ">=" else time.max)
            query = query.filter(model.Analytics.visit_time >= boundary) if comparison == ">=" else query.filter(model.Analytics.visit_time <= boundary)
        except ValueError:
            continue
    return query

# ============================================================
# REPORT HELPERS
# ============================================================
def _report_filters(report: model.Report) -> dict[str, Any]:
    return report.filters if isinstance(report.filters, dict) else {}

# ============================================================
# LIST REPORTS
# ============================================================
def _report_payload(report_type: str, report_name: str, store_id: Optional[int] = None) -> dict[str, Any]:
    return {
        "id": report_type,
        "report_id": report_type,
        "report_name": report_name,
        "report_type": report_type,
        "store_id": store_id,
    }


def _resolve_report_store_id(db: Session, store_id: Optional[int]) -> int:
    if store_id is not None:
        store = db.query(model.Store.id).filter(model.Store.id == store_id).first()
        if not store:
            raise HTTPException(status_code=404, detail="Store not found")
        return store_id
    store = db.query(model.Store.id).order_by(model.Store.id).first()
    if not store:
        raise HTTPException(status_code=404, detail="No store data is available for report generation")
    return store[0]


def _dynamic_report_data(db: Session, report_type: str, store_id: Optional[int]) -> tuple[dict[str, Any], int]:
    if report_type not in SUPPORTED_REPORT_TYPES:
        raise HTTPException(status_code=404, detail="Report type not found")
    resolved_store_id = _resolve_report_store_id(db, store_id)
    try:
        return get_dynamic_report_data(db, report_type, resolved_store_id), resolved_store_id
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

# ============================================================
# LIST REPORTS
# ============================================================
@router.get("/reports")
def list_reports(
    db: Session = Depends(get_db),
    admin_user: model.User = Depends(require_admin),
):
    return [_report_payload(report_type, report_name) for report_type, report_name in REPORT_CATALOG]


# ============================================================
# CREATE REPORT
# ============================================================
@router.post("/reports", status_code=status.HTTP_200_OK)
def create_report(
    payload: ReportCreate,
    db: Session = Depends(get_db),
    admin_user: model.User = Depends(require_admin),
):
    if payload.report_type.strip().lower() not in SUPPORTED_REPORT_TYPES:
        raise HTTPException(status_code=422, detail="report_type must be one of the five supported report types")
    _resolve_report_store_id(db, payload.store_id)
    report_name = dict(REPORT_CATALOG).get(payload.report_type.strip().lower(), payload.report_name)
    return _report_payload(payload.report_type.strip().lower(), report_name, payload.store_id)


# ============================================================
# GET COMPLETE REPORT
# ============================================================

@router.get("/reports/detail/{report_type}")
def get_report(
    report_type: str,
    store_id: Optional[int] = Query(default=None),
    db: Session = Depends(get_db),
    _admin_user: model.User = Depends(require_admin),
):
    report_data, resolved_store_id = _dynamic_report_data(db, report_type, store_id)
    report_name = dict(REPORT_CATALOG).get(report_type, report_type)
    payload = _report_payload(report_type, report_name, resolved_store_id)
    payload["data"] = report_data
    return payload

# ============================================================
# GET REPORT DATA ONLY
# ============================================================
@router.get("/reports/{report_type}/data")
def get_report_data_endpoint(
    report_type: str,
    store_id: Optional[int] = Query(default=None),
    db: Session = Depends(get_db),
    admin_user: model.User = Depends(require_admin),
):
    report_data, _resolved_store_id = _dynamic_report_data(db, report_type, store_id)
    return report_data

# ============================================================
# DELETE REPORT
# ============================================================

@router.delete(
    "/reports/{report_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_report(
    report_id: str,
    db: Session = Depends(get_db),
    admin_user: model.User = Depends(require_admin),
):
    raise HTTPException(status_code=405, detail="Dynamic reports are not stored and cannot be deleted")


@router.get("/reports/export")
def export_report(
    report_type: str = Query(...),
    store_id: Optional[int] = Query(default=None),
    format: str = Query(default="csv"),
    db: Session = Depends(get_db),
    admin_user: model.User = Depends(require_admin),
):
    report_data, resolved_store_id = _dynamic_report_data(db, report_type, store_id)
    rows = report_data["rows"]
    format_name = format.lower().strip()
    headers = list(rows[0].keys()) if rows else []
    values = [[row.get(header, "") for header in headers] for row in rows]

    if format_name == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(headers)
        writer.writerows(values)
        return Response(
            content=output.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={report_type}_store_{resolved_store_id}.csv"},
        )

    if format_name in {"xlsx", "excel"}:
        try:
            from openpyxl import Workbook
        except ImportError:
            raise HTTPException(status_code=501, detail="Excel export requires openpyxl. Install with pip install openpyxl")

        workbook = Workbook()
        sheet = workbook.active
        sheet.title = report_type.replace("_", " ").title()[:31]
        sheet.append(headers)
        for row in values:
            sheet.append(row)

        binary = io.BytesIO()
        workbook.save(binary)
        return Response(
            content=binary.getvalue(),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={report_type}_store_{resolved_store_id}.xlsx"},
        )

    if format_name == "pdf":
        try:
            from reportlab.lib.pagesizes import A4
            from reportlab.pdfgen import canvas
        except ImportError:
            raise HTTPException(status_code=501, detail="PDF export requires reportlab. Install with pip install reportlab")

        binary = io.BytesIO()
        pdf = canvas.Canvas(binary, pagesize=A4)
        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawString(40, 810, f"AI Consumer {report_type.replace('_', ' ').title()} Report")
        pdf.setFont("Helvetica", 8)
        y = 790
        pdf.drawString(40, y, ", ".join(headers))
        y -= 14
        for row in values:
            pdf.drawString(40, y, ", ".join(str(item) for item in row))
            y -= 12
            if y <= 40:
                pdf.showPage()
                pdf.setFont("Helvetica", 8)
                y = 810
        pdf.save()
        return Response(
            content=binary.getvalue(),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={report_type}_store_{resolved_store_id}.pdf"},
        )

    raise HTTPException(status_code=400, detail="Unsupported format. Use csv, xlsx, or pdf")


@router.get("/settings", response_model=list[SettingResponse])
def list_settings(db: Session = Depends(get_db), admin_user: model.User = Depends(require_admin)):
    return db.query(model.Setting).all()


@router.post("/settings", response_model=SettingResponse, status_code=status.HTTP_201_CREATED)
def create_setting(payload: SettingCreate, db: Session = Depends(get_db), admin_user: model.User = Depends(require_admin)):
    store = db.query(model.Store).first()
    if not store:
        raise HTTPException(status_code=404, detail="No store exists yet")
    setting = model.Setting(store_id=store.id, **payload.model_dump())
    db.add(setting)
    db.commit()
    db.refresh(setting)
    return setting
