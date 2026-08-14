"""
backend/app/services/stream_manager.py
Live Camera Stream Processor & HUD Video Annotation Generator
"""
import os
import cv2
import time
from .gaze_engine import analyze_frame_gaze
from .tracking_engine import transform_to_floorplan, zone_for_point

CAMERA_REGISTRY = [
    {"id": "CAM-01", "name": "Entrance Surveillance", "zone": "Entrance", "source_type": "file", "url": "app/sample_data/store_video.mp4"},
    {"id": "CAM-02", "name": "Shelf Gaze Cam #1", "zone": "Grocery & Snacks", "source_type": "file", "url": "app/sample_data/store_video.mp4"},
    {"id": "CAM-03", "name": "Electronics Aisle", "zone": "Electronics", "source_type": "file", "url": "app/sample_data/store_video.mp4"},
    {"id": "CAM-04", "name": "Checkout Live Feed", "zone": "Checkout", "source_type": "file", "url": "app/sample_data/store_video.mp4"},
    {"id": "CAM-WEBCAM", "name": "Live PC Webcam", "zone": "Live Demo", "source_type": "webcam", "url": "0"},
]

def draw_hud_annotations(frame, gaze_data: list, fps: float = 30.0):
    """Draws real-time HUD overlays: bounding boxes, 3D gaze rays, and dwell timers."""
    annotated = frame.copy()
    h, w = frame.shape[:2]

    # Top HUD Bar
    cv2.rectangle(annotated, (0, 0), (w, 42), (19, 26, 39), -1)
    cv2.putText(annotated, f"LIVE AI MONITOR | FPS: {fps:.1f} | SHOPPERS: {len(gaze_data)}", (16, 26),
                cv2.FONT_HERSHEY_SIMPLEX, 0.65, (232, 163, 61), 2, cv2.LINE_AA)

    for person in gaze_data:
        bx1, by1, bx2, by2 = map(int, person["bbox"])
        target = person["gaze_target"]
        score = person["attention_score"]
        is_golden = person["is_golden_zone"]
        is_reach = person["is_reaching"]

        # Bounding box color: Green for Golden Zone, Amber for standard, Red for reach
        box_color = (63, 191, 127) if is_golden else ((232, 101, 79) if is_reach else (232, 163, 61))
        cv2.rectangle(annotated, (bx1, by1), (bx2, by2), box_color, 2)

        # Draw 3D Gaze Vector Ray
        nx, ny = map(int, person["nose"])
        gx, gy = map(int, person["gaze_vector_end"])
        cv2.arrowedLine(annotated, (nx, ny), (gx, gy), (0, 255, 255), 2, tipLength=0.3)

        # Label badge
        label = f"{target} ({score}%)"
        if is_reach:
            label += " [SHELF TOUCH]"
        
        cv2.rectangle(annotated, (bx1, max(0, by1 - 24)), (bx1 + len(label) * 9, by1), (19, 26, 39), -1)
        cv2.putText(annotated, label, (bx1 + 4, max(14, by1 - 6)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.45, (237, 239, 243), 1, cv2.LINE_AA)

    return annotated

def generate_live_mjpeg_stream(camera_id: str):
    """Generator yielding multipart MJPEG frames with real-time AI annotation."""
    cam_info = next((c for c in CAMERA_REGISTRY if c["id"] == camera_id), CAMERA_REGISTRY[0])
    video_src = cam_info["url"]

    if cam_info["source_type"] == "webcam":
        cap = cv2.VideoCapture(0)
    else:
        if not os.path.exists(video_src):
            video_src = 0  # Fallback to webcam if sample video not found
        cap = cv2.VideoCapture(video_src)

    prev_time = time.time()

    try:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                ret, frame = cap.read()
                if not ret:
                    break

            # Calculate FPS
            curr_time = time.time()
            fps = 1.0 / max(1e-5, (curr_time - prev_time))
            prev_time = curr_time

            # Run Gaze & Pose Detection
            gaze_data = analyze_frame_gaze(frame)
            annotated_frame = draw_hud_annotations(frame, gaze_data, fps=fps)

            _, jpeg = cv2.imencode(".jpg", annotated_frame, [cv2.IMWRITE_JPEG_QUALITY, 75])
            frame_bytes = jpeg.tobytes()

            yield (b"--frame\r\n"
                   b"Content-Type: image/jpeg\r\n\r\n" + frame_bytes + b"\r\n")

            time.sleep(0.033)  # Approx 30 FPS
    finally:
        cap.release()