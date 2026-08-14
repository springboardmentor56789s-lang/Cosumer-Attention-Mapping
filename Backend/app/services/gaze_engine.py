"""
backend/app/services/gaze_engine.py
AI Gaze Attention & 3D Head Pose Estimation Engine
"""
import math
import numpy as np
import cv2
from ultralytics import YOLO

# Load pose model (downloads automatically if not present)
pose_model = YOLO("yolov8n-pose.pt")

SHELF_LEVELS = [
    {"name": "Top Shelf", "min_pitch": 12.0, "max_pitch": 45.0, "color": (255, 165, 0)},
    {"name": "Eye-Level (Golden Zone)", "min_pitch": -8.0, "max_pitch": 12.0, "color": (63, 191, 127)},
    {"name": "Reach Level", "min_pitch": -22.0, "max_pitch": -8.0, "color": (232, 163, 61)},
    {"name": "Bottom Shelf", "min_pitch": -45.0, "max_pitch": -22.0, "color": (91, 141, 239)},
    {"name": "Phone / Distracted", "min_pitch": -90.0, "max_pitch": -45.0, "color": (232, 101, 79)},
]

def estimate_head_pose(keypoints):
    """
    Computes Yaw, Pitch, Roll angles (in degrees) from 2D facial keypoints.
    Keypoints: 0: Nose, 1: L_Eye, 2: R_Eye, 3: L_Ear, 4: R_Ear, 5: L_Shoulder, 6: R_Shoulder
    """
    if keypoints is None or len(keypoints) < 7:
        return 0.0, 0.0, 0.0

    nose = keypoints[0][:2]
    l_eye = keypoints[1][:2]
    r_eye = keypoints[2][:2]
    l_ear = keypoints[3][:2]
    r_ear = keypoints[4][:2]
    l_shoulder = keypoints[5][:2]
    r_shoulder = keypoints[6][:2]

    # Check confidences if available
    eye_mid = (l_eye + r_eye) / 2.0
    eye_dist = np.linalg.norm(r_eye - l_eye)
    if eye_dist < 1e-4:
        eye_dist = 1.0

    # Yaw (horizontal head turn left-right)
    ear_mid = (l_ear + r_ear) / 2.0
    yaw_ratio = (nose[0] - eye_mid[0]) / eye_dist
    yaw_deg = float(np.clip(yaw_ratio * 45.0, -60.0, 60.0))

    # Pitch (vertical head tilt up-down)
    shoulder_mid = (l_shoulder + r_shoulder) / 2.0
    face_height = np.linalg.norm(eye_mid - shoulder_mid) * 0.5
    if face_height < 1e-4:
        face_height = 1.0
    pitch_ratio = (eye_mid[1] - nose[1]) / face_height
    pitch_deg = float(np.clip((pitch_ratio - 0.25) * 60.0, -60.0, 60.0))

    # Roll (head tilt side-to-side)
    delta_y = r_eye[1] - l_eye[1]
    delta_x = r_eye[0] - l_eye[0]
    roll_deg = float(math.degrees(math.atan2(delta_y, delta_x)))

    return round(yaw_deg, 1), round(pitch_deg, 1), round(roll_deg, 1)

def classify_gaze_target(yaw_deg, pitch_deg):
    """Classifies gaze direction into retail shelf levels or attention directions."""
    for level in SHELF_LEVELS:
        if level["min_pitch"] <= pitch_deg <= level["max_pitch"]:
            target_name = level["name"]
            break
    else:
        target_name = "Looking Straight"

    if abs(yaw_deg) > 30.0:
        horiz = "Looking Left" if yaw_deg < 0 else "Looking Right"
        return f"{target_name} ({horiz})"
    return target_name

def detect_product_reach(keypoints, person_bbox):
    """Detects if customer's wrist is reaching forward towards a shelf."""
    if keypoints is None or len(keypoints) < 11:
        return False
    l_wrist = keypoints[9]
    r_wrist = keypoints[10]
    l_shoulder = keypoints[5]
    r_shoulder = keypoints[6]

    # If wrist is above waist level and extended
    is_left_reach = l_wrist[2] > 0.4 and l_wrist[1] < (l_shoulder[1] + 60)
    is_right_reach = r_wrist[2] > 0.4 and r_wrist[1] < (r_shoulder[1] + 60)
    return is_left_reach or is_right_reach

def analyze_frame_gaze(frame, conf=0.3):
    """Runs pose detection and extracts gaze analytics for all individuals in a frame."""
    results = pose_model.predict(frame, conf=conf, verbose=False)
    people_gaze = []

    if results and len(results) > 0 and results[0].keypoints is not None:
        boxes = results[0].boxes.xyxy.cpu().numpy() if results[0].boxes is not None else []
        kpts_data = results[0].keypoints.data.cpu().numpy()

        for idx, (bbox, kpts) in enumerate(zip(boxes, kpts_data)):
            yaw, pitch, roll = estimate_head_pose(kpts)
            gaze_target = classify_gaze_target(yaw, pitch)
            is_reaching = detect_product_reach(kpts, bbox)

            # Vector end point for visual raycasting
            nose_x, nose_y = float(kpts[0][0]), float(kpts[0][1])
            ray_len = 70.0
            rad_yaw = math.radians(yaw)
            rad_pitch = math.radians(-pitch)
            vec_x = nose_x + ray_len * math.sin(rad_yaw)
            vec_y = nose_y + ray_len * math.sin(rad_pitch)

            # Attention score (0-100%) based on frontal alignment to shelf
            alignment = max(0.0, 1.0 - (abs(yaw) / 60.0) * 0.5 - (abs(pitch) / 60.0) * 0.5)
            attention_score = round(alignment * 100, 1)

            people_gaze.append({
                "person_idx": idx,
                "bbox": [round(float(c), 1) for c in bbox],
                "nose": [round(nose_x, 1), round(nose_y, 1)],
                "gaze_vector_end": [round(vec_x, 1), round(vec_y, 1)],
                "head_pose": {"yaw": yaw, "pitch": pitch, "roll": roll},
                "gaze_target": gaze_target,
                "attention_score": attention_score,
                "is_reaching": is_reaching,
                "is_golden_zone": "Golden Zone" in gaze_target,
            })

    return people_gaze