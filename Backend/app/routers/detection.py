import json
import asyncio
import os
import tempfile
import cv2
import numpy as np
from fastapi import APIRouter, UploadFile, File, Depends, WebSocket, WebSocketDisconnect, HTTPException
from ultralytics import YOLO

from ..auth import get_current_user

router = APIRouter()

# Load fine-tuned weights (best.pt) from Google Colab if present, otherwise default to yolov8n.pt
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CUSTOM_MODEL_PATH = os.path.join(BASE_DIR, "best.pt")
MODEL_TO_LOAD = CUSTOM_MODEL_PATH if os.path.exists(CUSTOM_MODEL_PATH) else "yolov8n.pt"

print(f"[CAMS AI Engine] Loading detection model weights from: {MODEL_TO_LOAD}")
model = YOLO(MODEL_TO_LOAD)

# Homography Matrix: Maps video pixels (u, v) -> 2D floorplan % coordinates (x, y)
src_pts = np.float32([[100, 200], [500, 200], [500, 600], [100, 600]])
dst_pts = np.float32([[12, 15], [78, 15], [78, 82], [12, 82]])
H, _ = cv2.findHomography(src_pts, dst_pts)

def transform_to_floorplan(u, v):
    """Translates camera frame pixels into top-down floorplan percentage coordinates."""
    pt = np.array([u, v, 1.0], dtype=np.float32)
    mapped = np.dot(H, pt)
    mapped /= mapped[2]
    return float(np.clip(mapped[0], 5, 95)), float(np.clip(mapped[1], 5, 95))


# -------------------------------------------------------------
# 1. Single-Image Detection Endpoint
# -------------------------------------------------------------
@router.post("/detect")
async def detect_people(file: UploadFile = File(...), user=Depends(get_current_user)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    results = model(frame, classes=[0])  # class 0 = person
    person_count = len(results[0].boxes)

    return {"people_detected": person_count}


# -------------------------------------------------------------
# 2. Uploaded Video Person/Face Tracking & Unique Count API
# -------------------------------------------------------------
@router.post("/detect-video")
async def detect_people_in_uploaded_video(file: UploadFile = File(...)):
    # Save uploaded video file to a temporary disk location
    suffix = os.path.splitext(file.filename)[1] or ".mp4"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_video:
        content = await file.read()
        temp_video.write(content)
        temp_file_path = temp_video.name

    try:
        cap = cv2.VideoCapture(temp_file_path)
        if not cap.isOpened():
            raise HTTPException(status_code=400, detail="Could not open video file.")

        fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration_sec = total_frames / fps if fps > 0 else 0

        unique_person_ids = set()
        frame_counts = []

        frame_idx = 0
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            frame_idx += 1
            # Process every 3rd frame to optimize speed
            if frame_idx % 3 != 0:
                continue

            # Reset tracker state on the first frame of a new video stream
            persist_flag = True if frame_idx > 3 else False

            # Run YOLO + ByteTrack frame processing
            results = model.track(
                frame, 
                tracker="bytetrack.yaml", 
                persist=persist_flag, 
                classes=[0],  # Class 0 = Person
                verbose=False
            )

            current_concurrent = 0
            if results[0].boxes is not None and results[0].boxes.id is not None:
                track_ids = results[0].boxes.id.cpu().numpy().astype(int)
                current_concurrent = len(track_ids)
                for tid in track_ids:
                    unique_person_ids.add(int(tid))

            time_sec = frame_idx / fps
            frame_counts.append({
                "timeSec": round(time_sec, 1),
                "count": current_concurrent
            })

        cap.release()

    finally:
        # Clean up temporary video file after processing
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

    # Compute video analytics summary
    unique_count = len(unique_person_ids)
    counts = [item["count"] for item in frame_counts] if frame_counts else [0]
    peak_count = max(counts)
    avg_count = round(sum(counts) / len(counts), 1) if counts else 0
    peak_item = next((item for item in frame_counts if item["count"] == peak_count), {"timeSec": 0})

    return {
        "fileName": file.filename,
        "duration": round(duration_sec, 1),
        "totalFrames": len(frame_counts),
        "uniqueCount": unique_count,
        "peak": peak_count,
        "avg": avg_count,
        "peakTime": peak_item["timeSec"],
        "frameResults": frame_counts
    }


# -------------------------------------------------------------
# 3. Live Video Real-Time Object Tracking WebSocket
# -------------------------------------------------------------
@router.websocket("/ws/track-video")
async def track_video_websocket(websocket: WebSocket):
    # Import unified zone matcher from tracking router
    from .tracking import zone_for_point

    await websocket.accept()
    try:
        # Receives video file path sent from React frontend
        video_path = await websocket.receive_text()
        cap = cv2.VideoCapture(video_path)

        shopper_zones = {}
        frame_idx = 0

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            frame_idx += 1
            persist_flag = True if frame_idx > 1 else False

            # Run YOLO + ByteTrack frame-by-frame
            results = model.track(
                frame, 
                tracker="bytetrack.yaml", 
                persist=persist_flag, 
                classes=[0], 
                verbose=False
            )

            active_shoppers = []

            if results[0].boxes is not None and results[0].boxes.id is not None:
                boxes = results[0].boxes.xyxy.cpu().numpy()
                track_ids = results[0].boxes.id.cpu().numpy().astype(int)

                for box, track_id in zip(boxes, track_ids):
                    x1, y1, x2, y2 = box
                    feet_u = (x1 + x2) / 2.0  # Bottom-center anchor point
                    feet_v = y2

                    pos_x, pos_y = transform_to_floorplan(feet_u, feet_v)
                    zone = zone_for_point(pos_x, pos_y)  # Use 6-zone polygon matcher

                    shopper_id = f"SHOPPER-{track_id}"
                    if shopper_id not in shopper_zones:
                        shopper_zones[shopper_id] = [zone]
                    elif zone not in shopper_zones[shopper_id]:
                        shopper_zones[shopper_id].append(zone)

                    active_shoppers.append({
                        "id": shopper_id,
                        "entryTime": "Just now",
                        "currentZone": zone,
                        "zonesVisited": shopper_zones[shopper_id],
                        "dwellSec": len(shopper_zones[shopper_id]) * 10,
                        "store": "Downtown Flagship",
                        "posX": pos_x,
                        "posY": pos_y,
                        "color": "#E8A33D"
                    })

            # Send live frame tracking payload over WebSocket
            await websocket.send_text(json.dumps(active_shoppers))
            await asyncio.sleep(0.03)  # Stream at ~30 FPS

        cap.release()
        await websocket.close()
    except WebSocketDisconnect:
        print("Tracking WebSocket disconnected")