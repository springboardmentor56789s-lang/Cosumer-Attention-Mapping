import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.services.video_pipeline_service import VideoPipelineService


def test_homography_maps_camera_point_to_blueprint_coordinates():
    service = VideoPipelineService()

    camera_points = [
        {"x": 100, "y": 100},
        {"x": 600, "y": 100},
        {"x": 600, "y": 400},
        {"x": 100, "y": 400},
    ]
    blueprint_points = [
        {"x": 50, "y": 50},
        {"x": 950, "y": 50},
        {"x": 950, "y": 850},
        {"x": 50, "y": 850},
    ]

    matrix = service._build_homography_matrix(camera_points, blueprint_points)
    mapped = service._map_point_to_blueprint((350, 250), matrix)

    assert mapped[0] > 0
    assert mapped[1] > 0
    assert mapped[0] < 1000
    assert mapped[1] < 900


def test_point_in_blueprint_polygon_detects_shelf_zone():
    service = VideoPipelineService()
    polygon = [
        {"x": 0, "y": 0},
        {"x": 200, "y": 0},
        {"x": 200, "y": 150},
        {"x": 0, "y": 150},
    ]

    assert service._point_in_polygon((50, 50), polygon)
    assert not service._point_in_polygon((250, 50), polygon)


def test_track_metrics_are_computed_from_blueprint_points():
    service = VideoPipelineService()
    path = [(10, 10), (30, 20), (80, 50)]
    traffic = service._calculate_traffic_metrics(path, [(0, 0), (100, 0), (100, 100), (0, 100)])

    assert traffic["total_points"] == 3
    assert traffic["distance_moved"] >= 0
    assert traffic["max_x"] >= 80
    assert traffic["max_y"] >= 50


def test_video_pipeline_maps_customer_centroid_to_blueprint_coordinates():
    service = VideoPipelineService()
    camera = type("Camera", (), {})()
    camera.calibration_points = {
        "source": [
            {"x": 0, "y": 0},
            {"x": 640, "y": 0},
            {"x": 640, "y": 360},
            {"x": 0, "y": 360},
        ],
        "target": [
            {"x": 50, "y": 50},
            {"x": 950, "y": 50},
            {"x": 950, "y": 850},
            {"x": 50, "y": 850},
        ],
    }
    camera.homography_matrix = service._build_homography_matrix(
        camera.calibration_points["source"],
        camera.calibration_points["target"],
    )
    camera.blueprint_polygon_zones = [{"name": "Aisle A", "points": [{"x": 100, "y": 100}, {"x": 500, "y": 100}, {"x": 500, "y": 500}, {"x": 100, "y": 500}]}]

    mapped = service._map_customer_point_to_blueprint((320, 180), camera)
    assert mapped[0] > 100
    assert mapped[1] > 100
    assert service._point_in_polygon(mapped, camera.blueprint_polygon_zones[0]["points"])
