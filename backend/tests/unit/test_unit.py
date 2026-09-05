import pytest
import numpy as np
from datetime import datetime, timedelta
from app.core.security import get_password_hash, verify_password, create_access_token, decode_access_token
from app.services.behavior_engine import BehaviorEngine
from yolo.detector import YOLOv8Detector
from bytetrack.tracker import ByteTracker

def test_unit_auth_hashing():
    password = "secretpassword123"
    hashed = get_password_hash(password)
    assert verify_password(password, hashed) is True
    assert verify_password("wrongpassword", hashed) is False

def test_unit_jwt_token_generation():
    token = create_access_token(subject="manager@dmart.com", role="Store Manager")
    assert isinstance(token, str)
    payload = decode_access_token(token)
    assert payload is not None
    assert payload["sub"] == "manager@dmart.com"
    assert payload["role"] == "Store Manager"

def test_unit_dwell_time_calculation():
    entry_time = datetime(2026, 9, 4, 10, 0, 0)
    exit_time = datetime(2026, 9, 4, 10, 0, 38)
    dwell_seconds = (exit_time - entry_time).total_seconds()
    assert dwell_seconds == 38.0

def test_unit_attention_duration_calculation():
    start_time = 12.4
    end_time = 18.2
    attention_duration = round(end_time - start_time, 1)
    assert attention_duration == 5.8

def test_unit_product_score_weighting():
    views = 245
    pickups = 184
    dwell_sec = 48
    # Formula: (pickups/views * 50) + min(50, dwell_sec)
    score = round(((pickups / views) * 50.0) + min(50.0, dwell_sec), 1)
    assert 0.0 <= score <= 100.0
    assert score == 85.6


def test_unit_yolo_detector_instantiation():
    detector = YOLOv8Detector(confidence_threshold=0.40)
    assert detector.confidence_threshold == 0.40
    frame_dummy = np.zeros((720, 1280, 3), dtype=np.uint8)
    detections = detector.detect_objects(frame_dummy)
    assert isinstance(detections, list)

def test_unit_bytetrack_tracker_update():
    tracker = ByteTracker(max_lost_frames=30)
    dummy_detections = [
        {"class": "person", "bbox": [100, 100, 50, 120], "confidence": 0.85}
    ]
    tracked = tracker.update(dummy_detections)
    assert isinstance(tracked, list)
