from types import SimpleNamespace

import numpy as np

from app.services.video_pipeline_service import VideoPipelineService


def test_get_camera_status_payload_reports_webcam_stream_state():
    service = VideoPipelineService.__new__(VideoPipelineService)
    camera = SimpleNamespace(
        id=7,
        status="Online",
        processing_status="Running",
        current_detection_status="Detecting",
        camera_type="webcam",
        rtsp_url=None,
        video_path=None,
        fps=24.0,
        last_active_at=None,
    )

    payload = service.get_camera_status(
        camera,
        is_streaming=True,
        frame_shape=(480, 640, 3),
        total_detections=3,
    )

    assert payload["camera_id"] == 7
    assert payload["status"] == "Online"
    assert payload["is_streaming"] is True
    assert payload["source"] == "webcam"
    assert payload["pipeline_ready"] is True
    assert payload["frame_shape"] == (480, 640, 3)


def test_capture_frame_at_seeks_to_the_selected_recorded_video_time():
    class Capture:
        def __init__(self):
            self.seek_milliseconds = None
            self.released = False

        def set(self, _property, value):
            self.seek_milliseconds = value

        def read(self):
            return True, np.zeros((360, 640, 3), dtype=np.uint8)

        def get(self, _property):
            return 30.0

        def release(self):
            self.released = True

    capture = Capture()
    service = VideoPipelineService.__new__(VideoPipelineService)
    service._open_capture = lambda _camera: capture

    frame, fps = service.capture_frame_at(SimpleNamespace(), 4.5)

    assert frame.shape[:2] == (360, 640)
    assert fps == 30.0
    assert capture.seek_milliseconds == 4500
    assert capture.released is True


def test_reference_frame_roi_scales_to_the_video_analysis_frame():
    roi = {
        "type": "rectangle",
        "points": [{"x": 100, "y": 100}, {"x": 300, "y": 100}, {"x": 300, "y": 300}, {"x": 100, "y": 300}],
        "reference_frame": {"width": 640, "height": 360},
    }

    assert VideoPipelineService._point_in_roi((400, 400), roi, frame_width=1280, frame_height=720)
    assert not VideoPipelineService._point_in_roi((700, 400), roi, frame_width=1280, frame_height=720)
