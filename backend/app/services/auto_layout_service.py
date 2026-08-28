from __future__ import annotations

from collections import defaultdict
from pathlib import Path
from typing import Any

import cv2
import numpy as np

from app import model


class AutoLayoutService:
    """Create a correction-ready camera layout from stable product detections."""

    def ensure_layout(self, db, camera: model.Camera, video_path: str, detector: Any) -> dict[str, Any]:
        existing = [zone for zone in camera.zones if zone.roi]
        if existing:
            return {"status": "reused", "zones": len(existing), "shelves": sum(len(zone.shelves) for zone in existing)}

        capture = cv2.VideoCapture(str(video_path))
        if not capture.isOpened():
            raise RuntimeError("Unable to open uploaded video for automatic layout detection.")

        width = int(capture.get(cv2.CAP_PROP_FRAME_WIDTH) or 0)
        height = int(capture.get(cv2.CAP_PROP_FRAME_HEIGHT) or 0)
        frame_count = int(capture.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
        samples = max(1, min(12, frame_count or 12))
        clusters: dict[tuple[int, int], list[tuple[float, float, float, float]]] = defaultdict(list)
        try:
            for sample in range(samples):
                if frame_count:
                    capture.set(cv2.CAP_PROP_POS_FRAMES, int(sample * max(0, frame_count - 1) / max(1, samples - 1)))
                ok, frame = capture.read()
                if not ok or frame is None:
                    continue
                height, width = frame.shape[:2]
                for detection in detector.detect_frame(frame, conf_threshold=0.3).get("detections", []):
                    if detection.get("class_name", "").lower() == "person":
                        continue
                    x1, y1, x2, y2 = (detection.get(key) for key in ("x1", "y1", "x2", "y2"))
                    if None in (x1, y1, x2, y2) or x2 <= x1 or y2 <= y1:
                        continue
                    center_x, center_y = (float(x1) + float(x2)) / 2, (float(y1) + float(y2)) / 2
                    clusters[(int(center_x // max(80, width * 0.12)), int(center_y // max(60, height * 0.12)))].append(
                        (float(x1), float(y1), float(x2), float(y2))
                    )
        finally:
            capture.release()

        if width <= 0 or height <= 0:
            raise RuntimeError("Uploaded video contains no readable frames for automatic layout detection.")

        shelf_boxes = []
        for detections in clusters.values():
            if len(detections) < 2:
                continue
            x1 = max(0, min(box[0] for box in detections) - 24)
            y1 = max(0, min(box[1] for box in detections) - 24)
            x2 = min(width - 1, max(box[2] for box in detections) + 24)
            y2 = min(height - 1, max(box[3] for box in detections) + 24)
            shelf_boxes.append((x1, y1, x2, y2))

        if not shelf_boxes:
            shelf_boxes = [(0, 0, width - 1, height - 1)]

        bands: dict[int, list[tuple[float, float, float, float]]] = defaultdict(list)
        for box in shelf_boxes:
            bands[int(((box[0] + box[2]) / 2) // max(160, width * 0.3))].append(box)

        created_shelves = 0
        for zone_index, boxes in enumerate(bands.values(), start=1):
            zone_bounds = (
                max(0, min(box[0] for box in boxes) - 30),
                max(0, min(box[1] for box in boxes) - 30),
                min(width - 1, max(box[2] for box in boxes) + 30),
                min(height - 1, max(box[3] for box in boxes) + 30),
            )
            zone = model.CameraZone(camera_id=camera.id, zone_name=f"Auto Zone {zone_index}", zone_code=f"AUTO-Z{zone_index}")
            db.add(zone)
            db.flush()
            db.add(model.CameraZoneROI(camera_id=camera.id, zone_id=zone.id, polygon_coordinates=self._roi(zone_bounds, width, height)))
            for shelf_index, box in enumerate(boxes, start=1):
                created_shelves += 1
                shelf = model.Shelf(
                    store_id=camera.store_id,
                    zone_id=zone.id,
                    shelf_name=f"Auto Shelf {created_shelves}",
                    shelf_number=f"AUTO-C{camera.id}-S{created_shelves}",
                    aisle=f"Aisle {zone_index}",
                    category="Auto-detected",
                    capacity=0,
                    status="Active",
                )
                db.add(shelf)
                db.flush()
                db.add(model.CameraShelfROI(camera_id=camera.id, shelf_id=shelf.id, polygon_coordinates=self._roi(box, width, height)))

        blueprint_mapped = self._initialize_blueprint_mapping(camera, width, height)
        db.commit()
        db.refresh(camera)
        return {
            "status": "generated",
            "zones": len(bands),
            "shelves": created_shelves,
            "layout_name": "Auto-generated Store Layout",
            "blueprint_mapped": blueprint_mapped,
        }

    @staticmethod
    def _roi(bounds: tuple[float, float, float, float], width: int, height: int) -> dict[str, Any]:
        x1, y1, x2, y2 = bounds
        return {
            "type": "rectangle",
            "points": [{"x": x1, "y": y1}, {"x": x2, "y": y1}, {"x": x2, "y": y2}, {"x": x1, "y": y2}],
            "reference_frame": {"width": width, "height": height},
        }

    @staticmethod
    def _initialize_blueprint_mapping(camera: model.Camera, width: int, height: int) -> bool:
        """Use the full camera frame when an existing blueprint has no calibration yet."""
        if camera.calibration_points or not width or not height:
            return False
        store = camera.store
        blueprint_url = camera.blueprint_url or (store.blueprint_url if store else None)
        blueprint_width = int(camera.blueprint_width or (store.blueprint_width if store else 0) or 0)
        blueprint_height = int(camera.blueprint_height or (store.blueprint_height if store else 0) or 0)
        if not blueprint_url or blueprint_width <= 0 or blueprint_height <= 0:
            return False
        source = [{"x": 0, "y": 0}, {"x": width, "y": 0}, {"x": width, "y": height}, {"x": 0, "y": height}]
        target = [{"x": 0, "y": 0}, {"x": blueprint_width, "y": 0}, {"x": blueprint_width, "y": blueprint_height}, {"x": 0, "y": blueprint_height}]
        matrix = cv2.getPerspectiveTransform(
            np.float32([[point["x"], point["y"]] for point in source]),
            np.float32([[point["x"], point["y"]] for point in target]),
        )
        camera.calibration_points = {"source": source, "target": target, "mode": "auto-generated"}
        camera.homography_matrix = matrix.tolist()
        return True