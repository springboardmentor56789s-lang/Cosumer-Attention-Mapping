from types import SimpleNamespace

import numpy as np

from app import model
from app.services.video_pipeline_service import VideoPipelineService


class _Capture:
    def __init__(self, frames):
        self.frames = iter(frames)

    def read(self):
        try:
            return True, next(self.frames)
        except StopIteration:
            return False, None

    def get(self, _property):
        return 8.0

    def release(self):
        pass


class _Tracker:
    def __init__(self):
        self.frame_number = 0

    def reset(self):
        self.frame_number = 0

    def update_tracks(self, _detections, frame=None):
        self.frame_number += 1
        x1 = 10 * self.frame_number
        return {
            "tracked_objects": {
                7: {
                    "id": 7,
                    "centroid": (x1 + 5, 15),
                    "bbox": {"x1": x1, "y1": 10, "x2": x1 + 10, "y2": 20},
                }
            }
        }


class _Detector:
    def detect_frame(self, _frame, conf_threshold):
        return {
            "detections": [
                {"class_name": "person", "confidence": 0.9, "x1": 10, "y1": 10, "x2": 20, "y2": 20},
                {"class_name": "bottle", "confidence": 0.8, "x1": 30, "y1": 10, "x2": 40, "y2": 20},
            ]
        }


class _Database:
    def __init__(self):
        self.saved = []
        self.added = []
        self.committed = False

    def bulk_save_objects(self, objects):
        self.saved.extend(objects)

    def add(self, object_):
        self.added.append(object_)

    def commit(self):
        self.committed = True


def test_video_analysis_aggregates_normal_writes_and_skips_unconfigured_replay():
    service = VideoPipelineService.__new__(VideoPipelineService)
    service.tracker = _Tracker()
    service.detector = _Detector()
    service.mediapipe = SimpleNamespace(detect_face_landmarks=lambda frame: {"success": False})
    service.gaze = SimpleNamespace()
    service._open_capture = lambda camera: _Capture([np.zeros((40, 60, 3), dtype=np.uint8) for _ in range(3)])
    service._camera_zones = lambda db, camera_id: []
    service._resize_for_inference = lambda frame, max_width: (frame, 1.0, 1.0)

    camera = SimpleNamespace(
        id=1,
        store_id=2,
        video_path="recorded.mp4",
        rtsp_url=None,
        camera_type="video",
        calibration_points={},
        homography_matrix=[],
        blueprint_polygon_zones=[],
        processing_status="Running",
        current_detection_status="Detecting",
        last_active_at=None,
        fps=0.0,
    )
    db = _Database()

    result = service.analyze_camera(db, camera, max_frames=3)

    assert result["processed_frames"] == 3
    assert result["analytics_saved"] == 1
    assert result["customer_tracks_saved"] == 1
    assert result["detection_rows_saved"] == 2
    assert result["reports_generated"] == 0
    assert sum(isinstance(item, model.VideoTrajectoryEvent) for item in db.saved) == 0
    assert sum(isinstance(item, model.Analytics) for item in db.saved) == 1
    assert sum(isinstance(item, model.CustomerTrack) for item in db.saved) == 1
    assert db.committed is True


def test_video_analysis_keeps_per_frame_trajectories_for_calibrated_blueprint_replay():
    service = VideoPipelineService.__new__(VideoPipelineService)
    service.tracker = _Tracker()
    service.detector = _Detector()
    service.mediapipe = SimpleNamespace(detect_face_landmarks=lambda frame: {"success": False})
    service.gaze = SimpleNamespace()
    service._open_capture = lambda camera: _Capture([np.zeros((40, 60, 3), dtype=np.uint8) for _ in range(3)])
    service._camera_zones = lambda db, camera_id: []
    service._resize_for_inference = lambda frame, max_width: (frame, 1.0, 1.0)

    camera = SimpleNamespace(
        id=1,
        store_id=2,
        video_path="recorded.mp4",
        rtsp_url=None,
        camera_type="video",
        calibration_points={"source": [{"x": 0, "y": 0}]},
        homography_matrix=[[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]],
        blueprint_polygon_zones=[],
        processing_status="Running",
        current_detection_status="Detecting",
        last_active_at=None,
        fps=0.0,
    )
    db = _Database()

    result = service.analyze_camera(db, camera, max_frames=3)

    assert result["processed_frames"] == 3
    trajectories = [item for item in db.saved if isinstance(item, model.VideoTrajectoryEvent)]
    assert len(trajectories) == 3
    assert [event.frame_number for event in trajectories] == [1, 2, 3]
    assert all(event.camera_id == camera.id for event in trajectories)