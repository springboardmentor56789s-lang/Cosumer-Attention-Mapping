"""
Gaze detection and estimation module.
Uses face and eye landmarks to estimate the user's head orientation and gaze direction.
"""

from typing import Any, Dict, List, Tuple

import numpy as np

try:
    import mediapipe as mp
    from mediapipe.tasks import python  # noqa: F401
    from mediapipe.tasks.python import vision  # noqa: F401
except ImportError:  # pragma: no cover - package optional at runtime
    mp = None
    vision = None


class GazeDetector:
    """Estimate gaze direction from face geometry without changing the existing ROI contract."""

    def __init__(self):
        self.face_detector = None
        self.hand_detector = None
        self.pose_detector = None
        self._initialize_detectors()
        self.gaze_history: List[Dict[str, Any]] = []

    def _initialize_detectors(self) -> None:
        if mp is None:
            return

        try:
            self.face_detector = "initialized"
        except Exception as exc:  # pragma: no cover - defensive guard
            print(f"Warning: Could not initialize face detector: {exc}")
            self.face_detector = None

    def detect_gaze_direction(self, face_landmarks: Dict[str, Any]) -> Dict[str, Any]:
        if not face_landmarks:
            return {"error": "No face landmarks provided"}

        left_eye = face_landmarks.get("left_eye") or face_landmarks.get("left_pupil")
        right_eye = face_landmarks.get("right_eye") or face_landmarks.get("right_pupil")
        nose = face_landmarks.get("nose") or face_landmarks.get("nose_tip")
        face_center = face_landmarks.get("face_center")

        if not left_eye or not right_eye:
            return {"error": "Eye landmarks not found"}

        gaze_vector = self._calculate_gaze_vector(left_eye, right_eye, nose, face_center)
        gaze_direction = self._classify_gaze_direction(gaze_vector)
        confidence = self._calculate_gaze_confidence(gaze_vector)

        result = {
            "gaze_vector": gaze_vector,
            "direction": gaze_direction,
            "confidence": round(confidence, 4),
            "horizontal": float(gaze_vector[0]),
            "vertical": float(gaze_vector[1]),
            "head_yaw": round(float(gaze_vector[0]) * 90.0, 2),
            "head_pitch": round(float(gaze_vector[1]) * 90.0, 2),
        }

        self.gaze_history.append(result)
        return result

    def detect_attention_to_shelf(self, face_landmarks: Dict[str, Any], shelf_bbox: Dict[str, float]) -> Dict[str, Any]:
        if not face_landmarks:
            return {"attention": False, "confidence": 0.0}

        gaze = self.detect_gaze_direction(face_landmarks)
        if "error" in gaze:
            return {"attention": False, "error": gaze["error"], "confidence": 0.0}

        face_center = face_landmarks.get("face_center", (0.0, 0.0))
        gaze_x = face_center[0] + gaze.get("horizontal", 0.0) * 150.0
        gaze_y = face_center[1] + gaze.get("vertical", 0.0) * 150.0

        shelf_x1 = float(shelf_bbox.get("x1", 0.0))
        shelf_y1 = float(shelf_bbox.get("y1", 0.0))
        shelf_x2 = float(shelf_bbox.get("x2", 0.0))
        shelf_y2 = float(shelf_bbox.get("y2", 0.0))

        is_looking = (shelf_x1 <= gaze_x <= shelf_x2) and (shelf_y1 <= gaze_y <= shelf_y2)
        confidence = gaze.get("confidence", 0.0) if is_looking else 0.0
        return {
            "shelf_bbox": shelf_bbox,
            "attention": is_looking,
            "confidence": round(float(confidence), 4),
            "gaze_point": (gaze_x, gaze_y),
        }

    def detect_multiple_objects_attention(self, face_landmarks: Dict[str, Any], objects: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        return [self.detect_attention_to_shelf(face_landmarks, obj) for obj in objects]

    def get_gaze_statistics(self) -> Dict[str, Any]:
        if not self.gaze_history:
            return {"total_frames": 0}

        directions = [g.get("direction") for g in self.gaze_history if "direction" in g]
        confidences = [g.get("confidence", 0.0) for g in self.gaze_history]
        direction_counts: Dict[str, int] = {}
        for direction in directions:
            if direction is None:
                continue
            direction_counts[direction] = direction_counts.get(direction, 0) + 1

        return {
            "total_frames": len(self.gaze_history),
            "direction_distribution": direction_counts,
            "average_confidence": round(float(np.mean(confidences)), 4) if confidences else 0.0,
            "max_confidence": max(confidences) if confidences else 0.0,
            "min_confidence": min(confidences) if confidences else 0.0,
        }

    def reset(self) -> None:
        self.gaze_history.clear()

    @staticmethod
    def _as_point(value: Any) -> Tuple[float, float]:
        if isinstance(value, dict):
            return float(value.get("x", 0.0)), float(value.get("y", 0.0))
        if isinstance(value, (list, tuple)) and len(value) >= 2:
            return float(value[0]), float(value[1])
        return 0.0, 0.0

    def _calculate_gaze_vector(
        self,
        left_eye: Dict[str, Any],
        right_eye: Dict[str, Any],
        nose: Any = None,
        face_center: Any = None,
    ) -> Tuple[float, float]:
        left_x, left_y = self._as_point(left_eye)
        right_x, right_y = self._as_point(right_eye)

        eye_center_x = (left_x + right_x) / 2.0
        eye_center_y = (left_y + right_y) / 2.0
        eye_distance = max(abs(right_x - left_x), abs(right_y - left_y), 1.0)

        if nose is not None:
            nose_x, nose_y = self._as_point(nose)
            horizontal = (nose_x - eye_center_x) / eye_distance
            vertical = (nose_y - eye_center_y) / eye_distance
        elif face_center is not None:
            cx, cy = self._as_point(face_center)
            horizontal = (cx - eye_center_x) / eye_distance
            vertical = (cy - eye_center_y) / eye_distance
        else:
            horizontal = (right_x - left_x) / eye_distance
            vertical = (right_y - left_y) / eye_distance

        return (round(float(horizontal), 4), round(float(vertical), 4))

    @staticmethod
    def _classify_gaze_direction(gaze_vector: Tuple[float, float]) -> str:
        gaze_x, gaze_y = gaze_vector
        if abs(gaze_x) < 0.12 and abs(gaze_y) < 0.12:
            return "center"
        if gaze_y < -0.15:
            return "up"
        if gaze_y > 0.15:
            return "down"
        if gaze_x < -0.15:
            return "left"
        if gaze_x > 0.15:
            return "right"
        return "center"

    @staticmethod
    def _calculate_gaze_confidence(gaze_vector: Tuple[float, float]) -> float:
        gaze_x, gaze_y = gaze_vector
        magnitude = float(np.hypot(gaze_x, gaze_y))
        return float(np.clip(magnitude * 1.5, 0.0, 1.0))
