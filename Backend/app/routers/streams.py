"""
backend/app/routers/streams.py
Real-time Video Streaming & Webcam Processing Router
"""
import cv2
import numpy as np
from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from ..services.stream_manager import CAMERA_REGISTRY, generate_live_mjpeg_stream
from ..services.gaze_engine import analyze_frame_gaze
from ..services.tracking_engine import transform_to_floorplan, zone_for_point

router = APIRouter(prefix="/api/stream", tags=["Streams"])

@router.get("/cameras")
def get_camera_streams():
    """Lists all configured store cameras and webcam feeds."""
    return {"cameras": CAMERA_REGISTRY}

@router.get("/live/{camera_id}")
def get_live_stream(camera_id: str):
    """Streams live MJPEG video with real-time AI gaze overlays."""
    return StreamingResponse(
        generate_live_mjpeg_stream(camera_id),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

@router.post("/process-frame")
async def process_live_webcam_frame(file: UploadFile = File(...)):
    """Processes a single frame from the user's browser webcam and returns gaze & floorplan metrics."""
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if frame is None:
        raise HTTPException(status_code=400, detail="Invalid image frame")

    h, w = frame.shape[:2]
    gaze_data = analyze_frame_gaze(frame)

    # Compute floorplan positions for each detected person
    for person in gaze_data:
        bx1, by1, bx2, by2 = person["bbox"]
        feet_u = (bx1 + bx2) / 2.0
        feet_v = by2
        fx, fy = transform_to_floorplan(feet_u, feet_v, frame_w=w, frame_h=h)
        person["floorplan"] = {"x": fx, "y": fy, "zone": zone_for_point(fx, fy)}

    return JSONResponse({
        "success": True,
        "people_count": len(gaze_data),
        "gaze_analytics": gaze_data,
    })
