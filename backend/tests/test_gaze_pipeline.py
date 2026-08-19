import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.ai.gaze import GazeDetector
from app.services.mediapipe_service import MediaPipeService


def test_gaze_detector_uses_eye_and_nose_geometry_for_direction():
    detector = GazeDetector()
    face_landmarks = {
        "face_center": (320, 240),
        "nose": {"x": 320, "y": 220},
        "left_eye": {"x": 260, "y": 230},
        "right_eye": {"x": 380, "y": 230},
        "left_pupil": {"x": 270, "y": 230},
        "right_pupil": {"x": 390, "y": 230},
    }

    gaze = detector.detect_gaze_direction(face_landmarks)

    assert "direction" in gaze
    assert gaze["direction"] in {"left", "right", "center", "up", "down"}
    assert gaze["confidence"] > 0
    assert gaze["horizontal"] != 0 or gaze["vertical"] != 0


def test_mediapipe_service_returns_face_data_for_real_frame_shape():
    service = MediaPipeService()
    frame = np.zeros((480, 640, 3), dtype=np.uint8)

    result = service.detect_face_landmarks(frame)

    assert result["success"] is True
    assert "landmarks" in result
    assert "face_center" in result["landmarks"]
