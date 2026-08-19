from __future__ import annotations
from collections import Counter
from dataclasses import dataclass
from datetime import datetime, timezone
import math
from pathlib import Path
import time
from typing import Any, Dict, Iterator, List, Optional, Tuple

try:
    import cv2
except ImportError:  # pragma: no cover
    cv2 = None

try:
    import numpy as np
except ImportError:  # pragma: no cover
    np = None

from sqlalchemy.orm import Session

from app import model
from app.ai.detect import ObjectDetector
from app.ai.gaze import GazeDetector
from app.services.mediapipe_service import MediaPipeService
from app.services.tracking_service import TrackingService

PRODUCT_CLASSES = {
    "product",
    "apple",
    "banana",
    "orange",
    "broccoli",
    "carrot",
    "sandwich",
    "pizza",
    "donut",
    "cake",
    "bottle",
    "cup",
    "wine glass",
    "fork",
    "knife",
    "spoon",
    "bowl",
    "refrigerator",
}


@dataclass
class FrameAnalytics:
    customer_id: int
    shelf_id: Optional[int]
    viewed_product: Optional[str]
    dwell_time: float
    distance_to_shelf: float
    face_direction: str
    head_angle: float
    looking_at_shelf: bool
    looking_at_product: bool
    walking_speed: float
    customer_path: str
    attention_score: float


class VideoPipelineService:
    """Frame-by-frame camera/video analytics pipeline."""

    _TARGET_ANALYSIS_FPS = 8.0
    _MAX_INFERENCE_WIDTH = 640
    _DB_BATCH_SIZE = 500

    def __init__(self, yolo_model: Optional[str] = None, device: str = "cpu"):
        self.detector = ObjectDetector(model_name=yolo_model, device=device)
        self.tracker = TrackingService()
        self.gaze = GazeDetector()
        self.mediapipe = MediaPipeService()
        self.pipeline_capabilities = ["YOLO", "MediaPipe", "Tracking", "Heatmap"]

    def __getattr__(self, name):
        if name == "pipeline_capabilities":
            return ["YOLO", "MediaPipe", "Tracking", "Heatmap"]
        raise AttributeError(name)

    def _build_homography_matrix(
        self,
        camera_points: List[Dict[str, float] | Tuple[float, float]],
        blueprint_points: List[Dict[str, float] | Tuple[float, float]],
    ) -> List[List[float]]:
        if cv2 is None or np is None:
            return [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]]
        if len(camera_points) < 4 or len(blueprint_points) < 4:
            return [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]]

        src = np.float32([
            [float(point[0] if isinstance(point, tuple) else point["x"]), float(point[1] if isinstance(point, tuple) else point["y"])]
            for point in camera_points[:4]
        ])
        dst = np.float32([
            [float(point[0] if isinstance(point, tuple) else point["x"]), float(point[1] if isinstance(point, tuple) else point["y"])]
            for point in blueprint_points[:4]
        ])

        matrix = cv2.getPerspectiveTransform(src, dst)
        return [[float(value) for value in row] for row in matrix.tolist()]

    def _map_point_to_blueprint(
        self,
        point: Tuple[float, float],
        homography_matrix: Optional[List[List[float]]],
    ) -> Tuple[float, float]:
        if not homography_matrix or not any(any(row) for row in homography_matrix):
            return point

        if cv2 is None or np is None:
            return point

        matrix = np.asarray(homography_matrix, dtype=np.float32)
        source = np.array([[point[0]], [point[1]], [1.0]], dtype=np.float32)
        transformed = matrix @ source
        denom = float(transformed[2, 0])
        if abs(denom) < 1e-6:
            return point
        return (
            float(transformed[0, 0] / denom),
            float(transformed[1, 0] / denom),
        )

    def _map_customer_point_to_blueprint(
        self,
        point: Tuple[float, float],
        camera: Any,
    ) -> Tuple[float, float]:
        calibration = getattr(camera, "calibration_points", {}) or {}
        source_points = calibration.get("source") if isinstance(calibration, dict) else None
        target_points = calibration.get("target") if isinstance(calibration, dict) else None
        if not source_points or not target_points:
            return point

        matrix = getattr(camera, "homography_matrix", None)
        if not matrix:
            matrix = self._build_homography_matrix(source_points, target_points)

        return self._map_point_to_blueprint(point, matrix)

    def _point_in_polygon(
        self,
        point: Tuple[float, float],
        polygon: List[Dict[str, float] | Tuple[float, float]],
    ) -> bool:
        if len(polygon) < 3:
            return False

        px, py = point

        for index, current in enumerate(polygon):
            prev = polygon[index - 1]
            x1 = float(current[0] if isinstance(current, tuple) else current.get("x", 0.0))
            y1 = float(current[1] if isinstance(current, tuple) else current.get("y", 0.0))
            x2 = float(prev[0] if isinstance(prev, tuple) else prev.get("x", 0.0))
            y2 = float(prev[1] if isinstance(prev, tuple) else prev.get("y", 0.0))

            min_x = min(x1, x2) - 1e-6
            max_x = max(x1, x2) + 1e-6
            min_y = min(y1, y2) - 1e-6
            max_y = max(y1, y2) + 1e-6

            if min_x <= px <= max_x and min_y <= py <= max_y:
                cross_product = (px - x1) * (y2 - y1) - (py - y1) * (x2 - x1)
                if abs(cross_product) <= 1e-6:
                    return True

        inside = False
        for index, current in enumerate(polygon):
            prev = polygon[index - 1]
            x1 = float(current[0] if isinstance(current, tuple) else current.get("x", 0.0))
            y1 = float(current[1] if isinstance(current, tuple) else current.get("y", 0.0))
            x2 = float(prev[0] if isinstance(prev, tuple) else prev.get("x", 0.0))
            y2 = float(prev[1] if isinstance(prev, tuple) else prev.get("y", 0.0))
            if ((y1 > py) != (y2 > py)) and (px < (x2 - x1) * (py - y1) / (y2 - y1) + x1):
                inside = not inside
        return inside

    def _calculate_traffic_metrics(
        self,
        path_points: List[Tuple[float, float]],
        zone_polygon: Optional[List[Dict[str, float] | Tuple[float, float]]] = None,
    ) -> Dict[str, Any]:
        points = []
        for item in path_points:
            if isinstance(item, dict):
                points.append((float(item.get("x", 0.0)), float(item.get("y", 0.0))))
            else:
                points.append((float(item[0]), float(item[1])))

        if not points:
            return {"total_points": 0, "distance_moved": 0.0, "max_x": 0.0, "max_y": 0.0, "inside_zone": 0, "zone_coverage": 0.0}

        distance = 0.0
        for index in range(1, len(points)):
            distance += math.hypot(points[index][0] - points[index - 1][0], points[index][1] - points[index - 1][1])

        x_vals = [value[0] for value in points]
        y_vals = [value[1] for value in points]
        inside_zone = 0
        if zone_polygon:
            for point in points:
                if self._point_in_polygon(point, zone_polygon):
                    inside_zone += 1

        return {
            "total_points": len(points),
            "distance_moved": round(distance, 2),
            "max_x": max(x_vals),
            "max_y": max(y_vals),
            "inside_zone": inside_zone,
            "zone_coverage": round((inside_zone / len(points)) * 100.0, 2) if points else 0.0,
        }

    def get_camera_status(
        self,
        camera: model.Camera,
        is_streaming: bool = False,
        frame_shape: Optional[Tuple[int, ...]] = None,
        total_detections: int = 0,
        error: Optional[str] = None,
    ) -> Dict[str, Any]:
        source = "webcam" if getattr(camera, "camera_type", "rtsp") == "webcam" else (camera.rtsp_url or camera.video_path or "unknown")
        return {
            "camera_id": camera.id,
            "status": camera.status or "Offline",
            "processing_status": camera.processing_status or "Idle",
            "current_detection_status": camera.current_detection_status or "Idle",
            "is_streaming": is_streaming,
            "source": source,
            "pipeline_ready": cv2 is not None,
            "capabilities": self.pipeline_capabilities,
            "frame_shape": frame_shape,
            "total_detections": total_detections,
            "fps": float(camera.fps or 0.0),
            "last_active_at": camera.last_active_at.isoformat() if getattr(camera, "last_active_at", None) else None,
            "error": error,
        }

    def capture_frame(self, camera: model.Camera) -> Tuple[Any, float]:
        return self.capture_frame_at(camera, 0.0)

    def capture_frame_at(self, camera: model.Camera, timestamp_seconds: float = 0.0) -> Tuple[Any, float]:
        cap = self._open_capture(camera)
        if cap is None:
            raise RuntimeError("OpenCV is not installed. Install opencv-python.")

        try:
            if timestamp_seconds > 0:
                cap.set(cv2.CAP_PROP_POS_MSEC, timestamp_seconds * 1000)
            ok, frame = cap.read()
            if not ok or frame is None:
                raise RuntimeError("Unable to read a frame from source")

            fps = float(cap.get(cv2.CAP_PROP_FPS) or 0.0)
            return frame, fps
        finally:
            cap.release()

    def iter_stream_frames(
        self,
        camera: model.Camera,
        db: Optional[Session] = None,
        conf_threshold: float = 0.25,
    ) -> Iterator[bytes]:
        cap = self._open_capture(camera)
        if cap is None:
            raise RuntimeError("OpenCV is not installed. Install opencv-python.")

        try:
            # Start each stream with a fresh tracker state to avoid stale IDs.
            self.tracker.reset()
            frame_idx = 0

            while True:
                ok, frame = cap.read()
                if not ok or frame is None:
                    break

                frame_idx += 1

                det_result = self.detector.detect_frame(frame, conf_threshold=conf_threshold)
                detections = det_result["detections"]
                person_dets = [d for d in detections if d.get("class_name", "").lower() == "person"]
                tracked = self.tracker.update_tracks(person_dets, frame=frame).get("tracked_objects", {})
                self._enrich_detections(camera, detections, tracked, self._camera_zones(db, camera.id) if db else [])

                if db is not None and tracked:
                    self._persist_stream_tracks(db, camera, tracked, frame_idx)

                annotated = self._annotate_stream_frame(frame, detections, tracked)

                _, buffer = cv2.imencode(".jpg", annotated, [cv2.IMWRITE_JPEG_QUALITY, 85])
                frame_bytes = buffer.tobytes()
                yield b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + frame_bytes + b"\r\n\r\n"
                time.sleep(0.03)
        finally:
            cap.release()

    def preview_camera(self, camera: model.Camera, db: Optional[Session] = None) -> Dict[str, Any]:
        frame, fps = self.capture_frame(camera)
        detections = self.detector.detect_frame(frame, conf_threshold=0.25)
        person_dets = [d for d in detections["detections"] if d.get("class_name", "").lower() == "person"]
        tracked = self.tracker.update_tracks(person_dets, frame=frame).get("tracked_objects", {})
        self._enrich_detections(camera, detections["detections"], tracked, self._camera_zones(db, camera.id) if db else [])
        customer_count = len(person_dets)

        return {
            "camera_id": camera.id,
            "frame_shape": detections.get("frame_shape"),
            "detections": detections["detections"],
            "total_detections": detections["total_detections"],
            "customer_count": customer_count,
            "fps": round(fps, 2),
        }

    def analyze_camera(
        self,
        db: Session,
        camera: model.Camera,
        max_frames: int = 120,
        conf_threshold: float = 0.25,
        process_all_frames: bool = False,
        output_video_path: Optional[str] = None,
        user_id: Optional[int] = None,
    ) -> Dict[str, Any]:
        analysis_started_at = datetime.now(timezone.utc)
        cap = self._open_capture(camera)
        if cap is None:
            raise RuntimeError("OpenCV is not installed. Install opencv-python.")

        self.tracker.reset()
        frame_idx = 0
        analytics_saved = 0
        tracks_saved = 0
        detection_rows_saved = 0
        heat_points: List[Tuple[float, float]] = []
        source_frame_idx = 0

        unique_customer_ids: set[int] = set()
        peak_customer_count = 0
        product_counter: Counter[str] = Counter()
        track_runtime: Dict[int, Dict[str, Any]] = {}
        analytics_aggregates: Dict[Tuple[int, Optional[int], Optional[str]], Dict[str, Any]] = {}
        track_summaries: Dict[int, Dict[str, Any]] = {}
        detection_events: Dict[Tuple[str, Optional[int], Optional[int], Optional[int]], model.Detection] = {}
        attention_values: List[float] = []
        dwell_values: List[float] = []
        pending_detections: List[model.Detection] = []
        pending_analytics: List[model.Analytics] = []
        pending_tracks: List[model.CustomerTrack] = []
        pending_trajectory_events: List[model.VideoTrajectoryEvent] = []
        zones = self._camera_zones(db, camera.id)
        blueprint_replay_enabled = bool(
            getattr(camera, "calibration_points", None)
            and getattr(camera, "homography_matrix", None)
        )

        fps = float(cap.get(cv2.CAP_PROP_FPS) or 0.0)
        frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH) or 0)
        frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT) or 0)
        sample_interval = self._compute_sampling_interval(fps, self._TARGET_ANALYSIS_FPS)
        analysis_fps = (fps / sample_interval) if fps > 0 else self._TARGET_ANALYSIS_FPS

        video_writer = None
        if output_video_path and frame_width > 0 and frame_height > 0:
            Path(output_video_path).parent.mkdir(parents=True, exist_ok=True)
            fourcc = cv2.VideoWriter_fourcc(*"mp4v")
            writer_fps = analysis_fps if analysis_fps > 0 else self._TARGET_ANALYSIS_FPS
            video_writer = cv2.VideoWriter(output_video_path, fourcc, writer_fps, (frame_width, frame_height))

        heatmap_accumulator = None
        if np is not None and frame_width > 0 and frame_height > 0:
            heatmap_accumulator = np.zeros((frame_height, frame_width), dtype=np.float32)

        while True:
            if not process_all_frames and frame_idx >= max_frames:
                break

            ok, frame = cap.read()
            if not ok or frame is None:
                break

            if (frame_width <= 0 or frame_height <= 0) and hasattr(frame, "shape"):
                frame_height, frame_width = frame.shape[:2]
                if output_video_path and video_writer is None and frame_width > 0 and frame_height > 0:
                    Path(output_video_path).parent.mkdir(parents=True, exist_ok=True)
                    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
                    writer_fps = analysis_fps if analysis_fps > 0 else self._TARGET_ANALYSIS_FPS
                    video_writer = cv2.VideoWriter(output_video_path, fourcc, writer_fps, (frame_width, frame_height))
                if heatmap_accumulator is None and np is not None and frame_width > 0 and frame_height > 0:
                    heatmap_accumulator = np.zeros((frame_height, frame_width), dtype=np.float32)

            source_frame_idx += 1
            if sample_interval > 1 and (source_frame_idx - 1) % sample_interval != 0:
                continue

            frame_idx += 1
            inference_frame, scale_x, scale_y = self._resize_for_inference(frame, self._MAX_INFERENCE_WIDTH)

            det_result = self.detector.detect_frame(inference_frame, conf_threshold=conf_threshold)
            detections = self._scale_detections_to_frame(
                det_result.get("detections", []),
                scale_x,
                scale_y,
                frame_width,
                frame_height,
            )
            person_dets_for_tracker = [d for d in det_result.get("detections", []) if d.get("class_name", "").lower() == "person"]
            person_dets = [d for d in detections if d.get("class_name", "").lower() == "person"]
            product_dets = [d for d in detections if self._is_product_class(d.get("class_name", ""))]
            tracked_inference = self.tracker.update_tracks(person_dets_for_tracker, frame=inference_frame).get("tracked_objects", {})
            tracked = self._scale_tracked_objects(tracked_inference, scale_x, scale_y, frame_width, frame_height)
            self._enrich_detections(camera, detections, tracked, zones, frame_width, frame_height)
            peak_customer_count = max(peak_customer_count, len(tracked))

            face = self.mediapipe.detect_face_landmarks(inference_frame)
            gaze_result: Dict[str, Any] = {}
            if face.get("success"):
                gaze_result = self.gaze.detect_gaze_direction(face.get("landmarks", {}))

            for detection in detections:
                x1 = detection.get("x1")
                y1 = detection.get("y1")
                x2 = detection.get("x2")
                y2 = detection.get("y2")
                if None in (x1, y1, x2, y2):
                    continue

                event_key = (
                    str(detection.get("class_name", "object")),
                    detection.get("zone_id"),
                    detection.get("shelf_id"),
                    detection.get("track_id"),
                )
                current_event = detection_events.get(event_key)
                if current_event is None or float(detection.get("confidence", 0.0) or 0.0) > current_event.confidence:
                    detection_events[event_key] = model.Detection(
                        camera_id=camera.id,
                        store_id=camera.store_id,
                        zone_id=detection.get("zone_id"),
                        shelf_id=detection.get("shelf_id"),
                        track_id=detection.get("track_id"),
                        detected_class=str(detection.get("class_name", "object")),
                        confidence=float(detection.get("confidence", 0.0) or 0.0),
                        bbox_x=int(x1),
                        bbox_y=int(y1),
                        bbox_w=max(0, int(x2) - int(x1)),
                        bbox_h=max(0, int(y2) - int(y1)),
                    )

                if self._is_product_class(detection.get("class_name", "")):
                    product_counter[str(detection.get("class_name", "unknown"))] += 1

            for obj_id, track in tracked.items():
                unique_customer_ids.add(int(obj_id))
                centroid = track.get("centroid", (0.0, 0.0))
                heat_points.append((float(centroid[0]), float(centroid[1])))

                runtime_metrics = self._update_track_runtime(track_runtime, int(obj_id), centroid, analysis_fps, frame_idx)
                nearest_product, distance_to_product = self._nearest_product(centroid, product_dets)

                if heatmap_accumulator is not None:
                    self._accumulate_heatmap_point(heatmap_accumulator, int(centroid[0]), int(centroid[1]))

                enriched = self._build_frame_analytics(
                    customer_id=int(obj_id),
                    centroid=centroid,
                    gaze_result=gaze_result,
                    frame_idx=frame_idx,
                    viewed_product=nearest_product,
                    distance_to_shelf=distance_to_product,
                    walking_speed=runtime_metrics["walking_speed"],
                    dwell_time=runtime_metrics["dwell_time"],
                    customer_path=runtime_metrics["customer_path"],
                )

                aggregate_key = (
                    enriched.customer_id,
                    enriched.shelf_id,
                    enriched.viewed_product,
                )
                aggregate = analytics_aggregates.setdefault(
                    aggregate_key,
                    {
                        "customer_id": enriched.customer_id,
                        "shelf_id": enriched.shelf_id,
                        "viewed_product": enriched.viewed_product,
                        "observed_duration": 0.0,
                        "attention_total": 0.0,
                        "distance_total": 0.0,
                        "walking_speed_total": 0.0,
                        "sample_count": 0,
                        "looking_at_shelf": False,
                        "looking_at_product": False,
                        "latest": enriched,
                    },
                )
                aggregate["observed_duration"] += 1.0 / max(analysis_fps, 1.0)
                aggregate["attention_total"] += float(enriched.attention_score or 0.0)
                aggregate["distance_total"] += float(enriched.distance_to_shelf or 0.0)
                aggregate["walking_speed_total"] += float(enriched.walking_speed or 0.0)
                aggregate["sample_count"] += 1
                aggregate["looking_at_shelf"] = aggregate["looking_at_shelf"] or enriched.looking_at_shelf
                aggregate["looking_at_product"] = aggregate["looking_at_product"] or enriched.looking_at_product
                aggregate["latest"] = enriched

                summary = track_summaries.setdefault(
                    enriched.customer_id,
                    {"attention_total": 0.0, "sample_count": 0, "latest": enriched},
                )
                summary["attention_total"] += float(enriched.attention_score or 0.0)
                summary["sample_count"] += 1
                summary["latest"] = enriched
                attention_values.append(float(enriched.attention_score or 0.0))
                dwell_values.append(float(enriched.dwell_time or 0.0))

                if blueprint_replay_enabled:
                    blueprint_point = self._map_customer_point_to_blueprint(centroid, camera)
                    zone_id = self._zone_id_for_point(blueprint_point, getattr(camera, "blueprint_polygon_zones", []) or [])
                    pending_trajectory_events.append(
                        model.VideoTrajectoryEvent(
                            video_id=str(camera.video_path or camera.rtsp_url or f"camera_{camera.id}"),
                            camera_id=camera.id,
                            frame_number=frame_idx,
                            timestamp=float(frame_idx / max(1.0, fps or self._TARGET_ANALYSIS_FPS)),
                            customer_id=int(obj_id),
                            camera_x=float(centroid[0]),
                            camera_y=float(centroid[1]),
                            blueprint_x=float(blueprint_point[0]),
                            blueprint_y=float(blueprint_point[1]),
                            zone_id=zone_id,
                        )
                    )

            if len(pending_trajectory_events) >= self._DB_BATCH_SIZE:
                db.bulk_save_objects(pending_trajectory_events)
                pending_trajectory_events.clear()

            if video_writer is not None:
                annotated_frame = self._annotate_stream_frame(
                    frame,
                    detections,
                    tracked,
                    customer_count=len(tracked),
                    unique_customer_count=len(unique_customer_ids),
                    total_product_detections=sum(product_counter.values()),
                    heatmap=heatmap_accumulator,
                )
                video_writer.write(annotated_frame)

        cap.release()
        if video_writer is not None:
            video_writer.release()

        pending_detections.extend(detection_events.values())
        detection_rows_saved = len(pending_detections)
        for aggregate in analytics_aggregates.values():
            latest = aggregate["latest"]
            sample_count = max(1, int(aggregate["sample_count"]))
            pending_analytics.append(
                model.Analytics(
                    customer_id=aggregate["customer_id"],
                    store_id=camera.store_id,
                    camera_id=camera.id,
                    shelf_id=aggregate["shelf_id"],
                    viewed_product=aggregate["viewed_product"],
                    dwell_time=round(float(aggregate["observed_duration"]), 2),
                    attention_score=round(float(aggregate["attention_total"]) / sample_count, 2),
                    distance_to_shelf=round(float(aggregate["distance_total"]) / sample_count, 2),
                    face_direction=latest.face_direction,
                    head_angle=latest.head_angle,
                    looking_at_shelf=aggregate["looking_at_shelf"],
                    looking_at_product=aggregate["looking_at_product"],
                    walking_speed=round(float(aggregate["walking_speed_total"]) / sample_count, 3),
                    customer_path=latest.customer_path,
                )
            )

        for customer_id, summary in track_summaries.items():
            latest = summary["latest"]
            sample_count = max(1, int(summary["sample_count"]))
            pending_tracks.append(
                model.CustomerTrack(
                    customer_id=customer_id,
                    store_id=camera.store_id,
                    camera_id=camera.id,
                    shelf_id=latest.shelf_id,
                    product_viewed=latest.viewed_product,
                    entry_time=datetime.now(timezone.utc),
                    dwell_time=latest.dwell_time,
                    distance_to_shelf=latest.distance_to_shelf,
                    face_direction=latest.face_direction,
                    head_angle=latest.head_angle,
                    looking_at_shelf=latest.looking_at_shelf,
                    looking_at_product=latest.looking_at_product,
                    walking_speed=latest.walking_speed,
                    customer_path=latest.customer_path,
                    attention_score=round(float(summary["attention_total"]) / sample_count, 2),
                )
            )

        analytics_saved = len(pending_analytics)
        tracks_saved = len(pending_tracks)
        self._flush_batch_writes(db, pending_detections, pending_analytics, pending_tracks, force=True)
        if pending_trajectory_events:
            db.bulk_save_objects(pending_trajectory_events)
            pending_trajectory_events.clear()

        camera.processing_status = "Idle"
        camera.current_detection_status = "Idle"
        camera.last_active_at = datetime.now(timezone.utc)
        camera.fps = fps if fps > 0 else float(camera.fps or 0.0)

        heatmap_image_path = None
        if output_video_path and heatmap_accumulator is not None and np is not None:
            heatmap_image_path = str(Path(output_video_path).with_name(f"{Path(output_video_path).stem}_heatmap.png"))
            self._save_heatmap_image(heatmap_accumulator, heatmap_image_path)

        top_products = [{"name": name, "count": count} for name, count in product_counter.most_common(5)]
        avg_attention = round(sum(attention_values) / len(attention_values), 2) if attention_values else 0.0
        avg_dwell = round(sum(dwell_values) / len(dwell_values), 2) if dwell_values else 0.0

        if heat_points:
            db.add(
                model.Heatmap(
                    store_id=camera.store_id,
                    camera_id=camera.id,
                    shelf_id=None,
                    heatmap_type="movement",
                    coordinates={
                        "points": heat_points,
                        "frame_size": {"width": frame_width, "height": frame_height},
                        "summary": {
                            "processed_frames": frame_idx,
                            "unique_customers": len(unique_customer_ids),
                            "peak_customers": peak_customer_count,
                            "total_product_detections": sum(product_counter.values()),
                            "detection_rows_saved": detection_rows_saved,
                            "avg_attention_score": avg_attention,
                            "avg_dwell_time": avg_dwell,
                        },
                        "artifacts": {
                            "annotated_video_path": output_video_path,
                            "heatmap_image_path": heatmap_image_path,
                        },
                        "top_products": top_products,
                    },
                )
            )

        db.commit()


        return {
            "camera_id": camera.id,
            "processed_frames": frame_idx,
            "analytics_saved": analytics_saved,
            "customer_tracks_saved": tracks_saved,
            "detection_rows_saved": detection_rows_saved,
            "heat_points": len(heat_points),
            "unique_customers": len(unique_customer_ids),
            "peak_customers": peak_customer_count,
            "reports_generated": 0,
            "total_product_detections": sum(product_counter.values()),
            "top_products": top_products,
            "annotated_video_path": output_video_path,
            "heatmap_image_path": heatmap_image_path,
            "avg_attention_score": avg_attention,
            "avg_dwell_time": avg_dwell,
        }

    def _open_capture(self, camera: model.Camera):
        if cv2 is None:
            return None

        if camera.camera_type == "webcam":
            source = 0
        elif camera.camera_type == "video":
            source = camera.video_path or camera.rtsp_url
        else:
            source = camera.rtsp_url

        return cv2.VideoCapture(source)

    def _build_frame_analytics(
        self,
        customer_id: int,
        centroid: Tuple[float, float],
        gaze_result: Dict[str, Any],
        frame_idx: int,
        viewed_product: Optional[str] = None,
        distance_to_shelf: float = 0.0,
        walking_speed: float = 0.0,
        dwell_time: Optional[float] = None,
        customer_path: Optional[str] = None,
    ) -> FrameAnalytics:
        face_direction = str(gaze_result.get("direction", "forward"))
        confidence = float(gaze_result.get("confidence", 0.0) or 0.0)
        looking = confidence >= 0.2

        attention_score = max(0.0, min(100.0, 40.0 + (confidence * 60.0)))
        dwell = round(dwell_time if dwell_time is not None else (frame_idx / 30.0), 2)

        return FrameAnalytics(
            customer_id=customer_id,
            shelf_id=None,
            viewed_product=viewed_product,
            dwell_time=dwell,
            distance_to_shelf=round(max(0.0, distance_to_shelf), 2),
            face_direction=face_direction,
            head_angle=0.0,
            looking_at_shelf=looking,
            looking_at_product=looking and viewed_product is not None,
            walking_speed=round(max(0.0, walking_speed), 3),
            customer_path=customer_path or f"({int(centroid[0])},{int(centroid[1])})",
            attention_score=round(attention_score, 2),
        )

    def _persist_stream_tracks(
        self,
        db: Session,
        camera: model.Camera,
        tracked_objects: Dict[int, Dict[str, Any]],
        frame_idx: int,
    ) -> None:
        try:
            for obj_id, track in tracked_objects.items():
                centroid = track.get("centroid", (0.0, 0.0))
                enriched = self._build_frame_analytics(
                    customer_id=int(obj_id),
                    centroid=centroid,
                    gaze_result={},
                    frame_idx=frame_idx,
                )

                db.add(
                    model.Analytics(
                        customer_id=enriched.customer_id,
                        store_id=camera.store_id,
                        camera_id=camera.id,
                        shelf_id=enriched.shelf_id,
                        viewed_product=enriched.viewed_product,
                        dwell_time=enriched.dwell_time,
                        attention_score=enriched.attention_score,
                        distance_to_shelf=enriched.distance_to_shelf,
                        face_direction=enriched.face_direction,
                        head_angle=enriched.head_angle,
                        looking_at_shelf=enriched.looking_at_shelf,
                        looking_at_product=enriched.looking_at_product,
                        walking_speed=enriched.walking_speed,
                        customer_path=enriched.customer_path,
                    )
                )

                db.add(
                    model.CustomerTrack(
                        customer_id=enriched.customer_id,
                        store_id=camera.store_id,
                        camera_id=camera.id,
                        shelf_id=enriched.shelf_id,
                        product_viewed=enriched.viewed_product,
                        entry_time=datetime.now(timezone.utc),
                        dwell_time=enriched.dwell_time,
                        distance_to_shelf=enriched.distance_to_shelf,
                        face_direction=enriched.face_direction,
                        head_angle=enriched.head_angle,
                        looking_at_shelf=enriched.looking_at_shelf,
                        looking_at_product=enriched.looking_at_product,
                        walking_speed=enriched.walking_speed,
                        customer_path=enriched.customer_path,
                        attention_score=enriched.attention_score,
                    )
                )

            camera.last_active_at = datetime.now(timezone.utc)
            db.commit()
        except Exception:
            db.rollback()

    def _annotate_stream_frame(
        self,
        frame: Any,
        detections: List[Dict[str, Any]],
        tracked_objects: Dict[int, Dict[str, Any]],
        customer_count: Optional[int] = None,
        unique_customer_count: Optional[int] = None,
        total_product_detections: Optional[int] = None,
        heatmap: Optional[Any] = None,
    ) -> Any:
        if cv2 is None:
            return frame

        annotated = frame.copy()

        if heatmap is not None and np is not None:
            normalized = cv2.normalize(heatmap, None, 0, 255, cv2.NORM_MINMAX).astype("uint8")
            colored = cv2.applyColorMap(normalized, cv2.COLORMAP_JET)
            annotated = cv2.addWeighted(annotated, 0.72, colored, 0.28, 0)

        # Draw raw YOLO detections (thin blue boxes) for context.
        for detection in detections:
            x1 = detection.get("x1")
            y1 = detection.get("y1")
            x2 = detection.get("x2")
            y2 = detection.get("y2")
            if None in (x1, y1, x2, y2):
                continue

            class_name = str(detection.get("class_name", "object"))
            if class_name.lower() == "person":
                color = (255, 180, 70)
            elif self._is_product_class(class_name):
                color = (70, 200, 255)
            else:
                color = (170, 170, 170)

            cv2.rectangle(annotated, (int(x1), int(y1)), (int(x2), int(y2)), color, 1)
            cv2.putText(
                annotated,
                class_name,
                (int(x1), max(16, int(y1) - 6)),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.45,
                color,
                1,
                cv2.LINE_AA,
            )

        # Draw ByteTrack tracks (green boxes) with stable track IDs.
        for track_id, track in tracked_objects.items():
            bbox = track.get("bbox", {})
            x1 = bbox.get("x1")
            y1 = bbox.get("y1")
            x2 = bbox.get("x2")
            y2 = bbox.get("y2")
            if None in (x1, y1, x2, y2):
                continue

            cv2.rectangle(annotated, (int(x1), int(y1)), (int(x2), int(y2)), (40, 220, 120), 2)
            label = f"ID {int(track_id)}"
            cv2.putText(
                annotated,
                label,
                (int(x1), max(20, int(y1) - 8)),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (40, 220, 120),
                2,
                cv2.LINE_AA,
            )

        overlay_lines = [
            f"Customers in frame: {customer_count if customer_count is not None else len(tracked_objects)}",
            f"Unique IDs in run: {unique_customer_count if unique_customer_count is not None else len(tracked_objects)}",
            f"Product detections: {total_product_detections if total_product_detections is not None else 0}",
        ]
        for idx, text in enumerate(overlay_lines):
            y = 26 + (idx * 24)
            cv2.putText(annotated, text, (14, y), cv2.FONT_HERSHEY_SIMPLEX, 0.62, (255, 255, 255), 3, cv2.LINE_AA)
            cv2.putText(annotated, text, (14, y), cv2.FONT_HERSHEY_SIMPLEX, 0.62, (35, 35, 35), 1, cv2.LINE_AA)

        return annotated

    def _is_product_class(self, class_name: str) -> bool:
        return str(class_name or "").strip().lower() in PRODUCT_CLASSES

    def _nearest_product(
        self,
        centroid: Tuple[float, float],
        product_detections: List[Dict[str, Any]],
    ) -> Tuple[Optional[str], float]:
        best_name: Optional[str] = None
        best_distance = 0.0
        min_distance = float("inf")

        for detection in product_detections:
            x1 = detection.get("x1")
            y1 = detection.get("y1")
            x2 = detection.get("x2")
            y2 = detection.get("y2")
            if None in (x1, y1, x2, y2):
                continue

            px = (float(x1) + float(x2)) / 2.0
            py = (float(y1) + float(y2)) / 2.0
            dist = ((centroid[0] - px) ** 2 + (centroid[1] - py) ** 2) ** 0.5
            if dist < min_distance:
                min_distance = dist
                best_name = str(detection.get("class_name", "product"))
                best_distance = dist

        return best_name, best_distance

    def _update_track_runtime(
        self,
        runtime_state: Dict[int, Dict[str, Any]],
        customer_id: int,
        centroid: Tuple[float, float],
        fps: float,
        frame_idx: int,
    ) -> Dict[str, Any]:
        state = runtime_state.setdefault(
            customer_id,
            {
                "start_frame": frame_idx,
                "last_centroid": centroid,
                "path": [centroid],
                "distance": 0.0,
            },
        )

        prev = state.get("last_centroid", centroid)
        step_distance = ((centroid[0] - prev[0]) ** 2 + (centroid[1] - prev[1]) ** 2) ** 0.5
        state["distance"] = float(state.get("distance", 0.0) or 0.0) + float(step_distance)
        state["last_centroid"] = centroid
        state["path"].append(centroid)

        frames_seen = max(1, frame_idx - int(state.get("start_frame", frame_idx)) + 1)
        fps_value = fps if fps > 0 else 30.0
        dwell_time = frames_seen / fps_value
        walking_speed = state["distance"] / max(dwell_time, 1e-6)

        return {
            "dwell_time": dwell_time,
            "walking_speed": walking_speed,
            "customer_path": self._serialize_path(state["path"]),
        }

    def _serialize_path(self, points: List[Tuple[float, float]]) -> str:
        if not points:
            return ""
        clipped = points[-25:]
        return "->".join(f"({int(x)},{int(y)})" for x, y in clipped)

    @staticmethod
    def _zone_id_for_point(point: Tuple[float, float], zones: List[Dict[str, Any]]) -> Optional[int]:
        for index, zone in enumerate(zones or []):
            polygon = (zone or {}).get("points") or []
            if not polygon:
                continue
            if VideoPipelineService()._point_in_polygon(point, polygon):
                return index + 1
        return None

    def _accumulate_heatmap_point(self, heatmap: Any, x: int, y: int) -> None:
        if np is None:
            return
        h, w = heatmap.shape[:2]
        radius = 16
        x1 = max(0, x - radius)
        x2 = min(w, x + radius + 1)
        y1 = max(0, y - radius)
        y2 = min(h, y + radius + 1)
        if x1 >= x2 or y1 >= y2:
            return

        yy, xx = np.ogrid[y1:y2, x1:x2]
        mask = ((xx - x) ** 2 + (yy - y) ** 2) <= (radius ** 2)
        heatmap[y1:y2, x1:x2][mask] += 1.0

    def _save_heatmap_image(self, heatmap: Any, output_path: str) -> None:
        if np is None or cv2 is None:
            return
        normalized = cv2.normalize(heatmap, None, 0, 255, cv2.NORM_MINMAX).astype("uint8")
        colored = cv2.applyColorMap(normalized, cv2.COLORMAP_JET)
        cv2.imwrite(output_path, colored)

    def _compute_sampling_interval(self, source_fps: float, target_fps: float) -> int:
        if source_fps <= 0 or target_fps <= 0:
            return 1
        return max(1, int(round(source_fps / target_fps)))

    def _resize_for_inference(self, frame: Any, max_width: int) -> Tuple[Any, float, float]:
        if cv2 is None or frame is None:
            return frame, 1.0, 1.0

        h, w = frame.shape[:2]
        if w <= 0 or h <= 0 or w <= max_width:
            return frame, 1.0, 1.0

        scale = float(max_width) / float(w)
        new_w = int(max(1, round(w * scale)))
        new_h = int(max(1, round(h * scale)))
        resized = cv2.resize(frame, (new_w, new_h), interpolation=cv2.INTER_AREA)
        return resized, float(w) / float(new_w), float(h) / float(new_h)

    def _scale_detections_to_frame(
        self,
        detections: List[Dict[str, Any]],
        scale_x: float,
        scale_y: float,
        frame_width: int,
        frame_height: int,
    ) -> List[Dict[str, Any]]:
        if not detections:
            return []

        scaled: List[Dict[str, Any]] = []
        max_x = max(0, frame_width - 1)
        max_y = max(0, frame_height - 1)

        for detection in detections:
            x1 = detection.get("x1")
            y1 = detection.get("y1")
            x2 = detection.get("x2")
            y2 = detection.get("y2")
            if None in (x1, y1, x2, y2):
                continue

            sx1 = int(round(float(x1) * scale_x))
            sy1 = int(round(float(y1) * scale_y))
            sx2 = int(round(float(x2) * scale_x))
            sy2 = int(round(float(y2) * scale_y))

            sx1 = min(max(0, sx1), max_x)
            sy1 = min(max(0, sy1), max_y)
            sx2 = min(max(0, sx2), max_x)
            sy2 = min(max(0, sy2), max_y)

            scaled.append(
                {
                    "class_name": detection.get("class_name"),
                    "confidence": detection.get("confidence"),
                    "x1": sx1,
                    "y1": sy1,
                    "x2": sx2,
                    "y2": sy2,
                }
            )

        return scaled

    @staticmethod
    def _camera_zones(db: Optional[Session], camera_id: int) -> List[model.CameraZone]:
        if db is None:
            return []
        return db.query(model.CameraZone).filter(model.CameraZone.camera_id == camera_id).all()

    def _enrich_detections(
        self,
        camera: model.Camera,
        detections: List[Dict[str, Any]],
        tracked: Dict[int, Dict[str, Any]],
        zones: List[model.CameraZone],
        frame_width: Optional[int] = None,
        frame_height: Optional[int] = None,
    ) -> None:
        """Attach ROI hierarchy and nearest ByteTrack ID without changing tracker input."""
        for detection in detections:
            x1, y1, x2, y2 = (detection.get(key) for key in ("x1", "y1", "x2", "y2"))
            if None in (x1, y1, x2, y2):
                continue
            center = ((float(x1) + float(x2)) / 2, (float(y1) + float(y2)) / 2)
            zone = next((item for item in zones if self._point_in_roi(center, item.roi, frame_width, frame_height)), None)
            shelf = next((item for item in (zone.shelves if zone else []) if self._point_in_roi(center, item.roi, frame_width, frame_height)), None)
            detection["camera_id"] = camera.id
            detection["zone_id"] = zone.id if zone else None
            detection["shelf_id"] = shelf.id if shelf else None
            detection["track_id"] = self._matching_track_id(center, tracked)
            detection["bbox"] = {"x1": int(x1), "y1": int(y1), "x2": int(x2), "y2": int(y2)}

    @staticmethod
    def _matching_track_id(center: Tuple[float, float], tracked: Dict[int, Dict[str, Any]]) -> Optional[int]:
        for track_id, track in tracked.items():
            bbox = track.get("bbox", {})
            if bbox.get("x1", float("inf")) <= center[0] <= bbox.get("x2", float("-inf")) and bbox.get("y1", float("inf")) <= center[1] <= bbox.get("y2", float("-inf")):
                return int(track_id)
        return None

    @staticmethod
    def _point_in_roi(
        point: Tuple[float, float],
        roi: Any,
        frame_width: Optional[int] = None,
        frame_height: Optional[int] = None,
    ) -> bool:
        if not isinstance(roi, dict):
            return False
        points = roi.get("points") or []
        if len(points) < 3:
            return False
        reference_frame = roi.get("reference_frame") or {}
        reference_width = float(reference_frame.get("width") or 0)
        reference_height = float(reference_frame.get("height") or 0)
        scale_x = float(frame_width) / reference_width if frame_width and reference_width else 1.0
        scale_y = float(frame_height) / reference_height if frame_height and reference_height else 1.0
        x, y = point
        # Rectangle and polygon are both represented as points; ray casting handles each.
        inside = False
        for index, current in enumerate(points):
            previous = points[index - 1]
            x1, y1 = float(current.get("x", 0)) * scale_x, float(current.get("y", 0)) * scale_y
            x2, y2 = float(previous.get("x", 0)) * scale_x, float(previous.get("y", 0)) * scale_y
            if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1:
                inside = not inside
        return inside

    def _scale_tracked_objects(
        self,
        tracked_objects: Dict[int, Dict[str, Any]],
        scale_x: float,
        scale_y: float,
        frame_width: int,
        frame_height: int,
    ) -> Dict[int, Dict[str, Any]]:
        if not tracked_objects:
            return {}

        max_x = max(0, frame_width - 1)
        max_y = max(0, frame_height - 1)
        scaled: Dict[int, Dict[str, Any]] = {}

        for track_id, track in tracked_objects.items():
            bbox = track.get("bbox", {})
            x1 = bbox.get("x1")
            y1 = bbox.get("y1")
            x2 = bbox.get("x2")
            y2 = bbox.get("y2")
            if None in (x1, y1, x2, y2):
                continue

            sx1 = min(max(0, int(round(float(x1) * scale_x))), max_x)
            sy1 = min(max(0, int(round(float(y1) * scale_y))), max_y)
            sx2 = min(max(0, int(round(float(x2) * scale_x))), max_x)
            sy2 = min(max(0, int(round(float(y2) * scale_y))), max_y)

            centroid = ((sx1 + sx2) / 2.0, (sy1 + sy2) / 2.0)
            scaled[int(track_id)] = {
                "id": int(track.get("id", track_id)),
                "centroid": centroid,
                "disappeared": int(track.get("disappeared", 0) or 0),
                "status": track.get("status", "active"),
                "bbox": {"x1": sx1, "y1": sy1, "x2": sx2, "y2": sy2},
            }

        return scaled

    def _flush_batch_writes(
        self,
        db: Session,
        pending_detections: List[model.Detection],
        pending_analytics: List[model.Analytics],
        pending_tracks: List[model.CustomerTrack],
        batch_size: int = 500,
        force: bool = False,
    ) -> None:
        pending_total = len(pending_detections) + len(pending_analytics) + len(pending_tracks)
        if pending_total == 0:
            return
        if not force and pending_total < max(1, batch_size):
            return

        if pending_detections:
            db.bulk_save_objects(pending_detections)
            pending_detections.clear()
        if pending_analytics:
            db.bulk_save_objects(pending_analytics)
            pending_analytics.clear()
        if pending_tracks:
            db.bulk_save_objects(pending_tracks)
            pending_tracks.clear()
