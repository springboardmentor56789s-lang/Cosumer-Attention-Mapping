from app.services.tracking_service import TrackingService


def test_bytetrack_preserves_normalized_track_contract_and_ids():
    service = TrackingService()
    detections = [{"x1": 10, "y1": 20, "x2": 50, "y2": 100, "confidence": 0.9, "class_name": "person"}]

    first = service.update_tracks(detections)
    second = service.update_tracks([
        {"x1": 12, "y1": 20, "x2": 52, "y2": 100, "confidence": 0.92, "class_name": "person"}
    ])

    assert first["total_tracked"] == 1
    assert second["total_tracked"] == 1
    first_id = next(iter(first["tracked_objects"]))
    tracked = second["tracked_objects"][first_id]
    assert tracked["id"] == first_id
    assert tracked["bbox"]["x1"] >= 10
    assert tracked["bbox"]["x2"] > tracked["bbox"]["x1"]
    assert tracked["bbox"]["y2"] > tracked["bbox"]["y1"]
    assert tracked["centroid"][0] > 0
    assert tracked["centroid"][1] > 0


def test_bytetrack_reset_starts_a_new_video_session():
    service = TrackingService()
    detections = [{"x1": 10, "y1": 20, "x2": 50, "y2": 100, "confidence": 0.9, "class_name": "person"}]
    service.update_tracks(detections)

    service.reset()
    result = service.update_tracks(detections)

    assert result["frame_number"] == 1
    assert result["total_tracked"] == 1
    assert service.get_all_trajectories()[1]["start_frame"] == 1