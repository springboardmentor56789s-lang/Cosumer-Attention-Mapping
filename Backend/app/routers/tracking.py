"""
backend/app/routers/tracking.py
Full Video Customer Tracking & Journey Extraction Router
"""
import os
import tempfile
from datetime import datetime, timedelta
import cv2
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from ultralytics import YOLO

from ..services.tracking_engine import transform_to_floorplan, zone_for_point, STORE_ZONES
from ..services.gaze_engine import estimate_head_pose, classify_gaze_target

router = APIRouter()
person_model = YOLO("yolov8n.pt")
SAMPLE_EVERY_N_FRAMES = 3

@router.post("/track-video")
async def track_video(file: UploadFile = File(...), store: str = Form(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")

    suffix = os.path.splitext(file.filename)[1] or ".mp4"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_video:
        content = await file.read()
        temp_video.write(content)
        temp_file_path = temp_video.name

    try:
        cap = cv2.VideoCapture(temp_file_path)
        if not cap.isOpened():
            raise HTTPException(status_code=400, detail="Could not open uploaded video")

        fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
        frame_w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)) or 1280
        frame_h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)) or 720
        seconds_per_sample = (SAMPLE_EVERY_N_FRAMES / fps) if fps else 0.1

        track_zone_sequence = {}
        track_zone_counts = {}
        track_frame_totals = {}
        track_trajectories = {}

        frame_idx = 0
        analyzed_frames = 0

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            frame_idx += 1
            if frame_idx % SAMPLE_EVERY_N_FRAMES != 0:
                continue

            results = person_model.track(
                frame,
                tracker="bytetrack.yaml",
                persist=True,
                classes=[0],  # Person
                conf=0.25,
                verbose=False,
            )
            analyzed_frames += 1

            if results[0].boxes is not None and results[0].boxes.id is not None:
                boxes = results[0].boxes.xyxy.cpu().numpy()
                track_ids = results[0].boxes.id.cpu().numpy().astype(int)

                for box, track_id in zip(boxes, track_ids):
                    x1, y1, x2, y2 = box
                    feet_u = (x1 + x2) / 2.0
                    feet_v = y2

                    pos_x, pos_y = transform_to_floorplan(feet_u, feet_v, frame_w, frame_h)
                    zone = zone_for_point(pos_x, pos_y)

                    tid = int(track_id)
                    track_frame_totals[tid] = track_frame_totals.get(tid, 0) + 1
                    track_zone_counts.setdefault(tid, {})
                    track_zone_counts[tid][zone] = track_zone_counts[tid].get(zone, 0) + 1

                    seq = track_zone_sequence.setdefault(tid, [])
                    if not seq or seq[-1] != zone:
                        seq.append(zone)

                    traj = track_trajectories.setdefault(tid, [])
                    traj.append({"x": pos_x, "y": pos_y, "zone": zone, "frame": frame_idx})

        cap.release()

        if not track_frame_totals:
            raise HTTPException(
                status_code=422,
                detail="No person detected in this video — try a clip with someone clearly walking through frame",
            )

        primary_id = max(track_frame_totals, key=track_frame_totals.get)
        zone_sequence = track_zone_sequence[primary_id]
        zone_counts = track_zone_counts[primary_id]

        if zone_sequence[0] != "Entrance":
            zone_sequence.insert(0, "Entrance")
        if zone_sequence[-1] != "Exit":
            zone_sequence.append("Exit")

        zone_dwell = [
            {"zone": z, "sec": round(count * seconds_per_sample, 1)}
            for z, count in zone_counts.items()
        ]

        person_dwell_sec = round(track_frame_totals[primary_id] * seconds_per_sample)
        now = datetime.now()
        entry_dt = now - timedelta(seconds=person_dwell_sec)

        # Multi-shopper summary list
        all_shoppers = []
        for tid, count in track_frame_totals.items():
            all_shoppers.append({
                "shopperId": f"SHOPPER-{tid:02d}",
                "dwellSec": round(count * seconds_per_sample),
                "zonesVisited": len(track_zone_counts.get(tid, {})),
                "path": track_zone_sequence.get(tid, []),
                "trajectory": track_trajectories.get(tid, [])[::2],  # downsample for UI
            })

        return {
            "shopperId": f"SHOPPER-{primary_id}",
            "store": store,
            "entryTime": entry_dt.strftime("%I:%M %p"),
            "exitTime": now.strftime("%I:%M %p"),
            "totalDwellSec": person_dwell_sec,
            "path": zone_sequence,
            "zoneDwell": zone_dwell,
            "framesAnalyzed": analyzed_frames,
            "peopleDetected": len(track_frame_totals),
            "allShoppers": all_shoppers,
        }

    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

@router.get("/common-pathways")
def get_common_pathways():
    """Return dominant shopper navigation pathways and network metrics."""
    from ..services.pathway_engine import get_common_pathways_data
    return get_common_pathways_data()