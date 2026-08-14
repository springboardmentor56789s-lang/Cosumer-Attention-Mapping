import os
import tempfile
from datetime import datetime, timedelta

import cv2
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from ultralytics import YOLO

# Reuse the homography transform from detection.py
from .detection import transform_to_floorplan

router = APIRouter()

# Load standard YOLOv8 pre-trained model dedicated for Person Tracking
# (Ensures COCO Class 0 = Person, regardless of what best.pt was trained on)
person_model = YOLO("yolov8n.pt")

STORE_ZONES = [
    {"name": "Entrance", "x": 12, "y": 15, "width": 22, "height": 18},
    {"name": "Grocery & Snacks", "x": 12, "y": 38, "width": 30, "height": 25},
    {"name": "Electronics", "x": 45, "y": 45, "width": 28, "height": 28},
    {"name": "Apparel", "x": 45, "y": 15, "width": 28, "height": 25},
    {"name": "Checkout", "x": 78, "y": 72, "width": 18, "height": 22},
    {"name": "Exit", "x": 78, "y": 15, "width": 18, "height": 18},
]

SAMPLE_EVERY_N_FRAMES = 3


def zone_for_point(px_pct: float, py_pct: float) -> str:
    """Bucket a floorplan-percentage point into the containing/nearest zone."""
    for zone in STORE_ZONES:
        if (
            zone["x"] <= px_pct <= zone["x"] + zone["width"]
            and zone["y"] <= py_pct <= zone["y"] + zone["height"]
        ):
            return zone["name"]

    def dist(z):
        zx, zy = z["x"] + z["width"] / 2, z["y"] + z["height"] / 2
        return (zx - px_pct) ** 2 + (zy - py_pct) ** 2

    return min(STORE_ZONES, key=dist)["name"]


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
        seconds_per_sample = (SAMPLE_EVERY_N_FRAMES / fps) if fps else 0

        track_zone_sequence = {}
        track_zone_counts = {}
        track_frame_totals = {}

        frame_idx = 0
        analyzed_frames = 0

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            frame_idx += 1
            if frame_idx % SAMPLE_EVERY_N_FRAMES != 0:
                continue

            persist_flag = True if frame_idx > SAMPLE_EVERY_N_FRAMES else False

            # Run person_model (yolov8n.pt) for human tracking with lower confidence threshold
            results = person_model.track(
                frame,
                tracker="bytetrack.yaml",
                persist=persist_flag,
                classes=[0],  # Class 0 = Person in yolov8n.pt
                conf=0.25,    # Lower threshold to detect distant people
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

                    pos_x, pos_y = transform_to_floorplan(feet_u, feet_v)
                    zone = zone_for_point(pos_x, pos_y)

                    tid = int(track_id)
                    track_frame_totals[tid] = track_frame_totals.get(tid, 0) + 1
                    track_zone_counts.setdefault(tid, {})
                    track_zone_counts[tid][zone] = track_zone_counts[tid].get(zone, 0) + 1

                    seq = track_zone_sequence.setdefault(tid, [])
                    if not seq or seq[-1] != zone:
                        seq.append(zone)

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
        }

    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)