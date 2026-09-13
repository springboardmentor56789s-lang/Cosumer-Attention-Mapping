import pytest
import numpy as np
from yolo.detector import YOLOv8Detector
from bytetrack.tracker import ByteTracker

def test_ai_pipeline_person_detection():
    detector = YOLOv8Detector(confidence_threshold=0.35)
    frame = np.zeros((720, 1280, 3), dtype=np.uint8)
    detections = detector.detect_objects(frame)
    assert isinstance(detections, list)

def test_ai_pipeline_bytetrack_tracking_consistency():
    """
    Verify tracking consistency across 3 sequential frames:
    Frame 1 -> Person ID 1
    Frame 2 -> Person ID 1
    Frame 3 -> Person ID 1
    The same person should maintain a stable ID across consecutive frames.
    """
    tracker = ByteTracker(max_lost_frames=30, smoothing_factor=0.7)

    # Frame 1
    frame1_det = [{"class": "person", "bbox": [200, 200, 60, 150], "confidence": 0.90}]
    tracks_f1 = tracker.update(frame1_det)
    assert len(tracks_f1) == 1
    person_id_f1 = tracks_f1[0]["id"]

    # Frame 2 (Slight movement)
    frame2_det = [{"class": "person", "bbox": [205, 202, 60, 150], "confidence": 0.92}]
    tracks_f2 = tracker.update(frame2_det)
    assert len(tracks_f2) == 1
    person_id_f2 = tracks_f2[0]["id"]

    # Frame 3 (Further movement)
    frame3_det = [{"class": "person", "bbox": [210, 205, 60, 150], "confidence": 0.91}]
    tracks_f3 = tracker.update(frame3_det)
    assert len(tracks_f3) == 1
    person_id_f3 = tracks_f3[0]["id"]

    # Verify ID persistence across frames
    assert person_id_f1 == person_id_f2 == person_id_f3, f"Tracking ID mutated across frames: F1={person_id_f1}, F2={person_id_f2}, F3={person_id_f3}"

