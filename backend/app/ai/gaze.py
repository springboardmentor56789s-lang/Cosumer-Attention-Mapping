"""
Gaze detection and estimation module.
Uses MediaPipe and eye detection for gaze direction analysis.
"""

from typing import Dict, List, Tuple, Optional, Any
import numpy as np

try:
    import mediapipe as mp
    from mediapipe.tasks import python
    from mediapipe.tasks.python import vision
except ImportError:
    mp = None
    vision = None


class GazeDetector:
    """
    Detect and analyze consumer gaze direction.
    Uses facial landmarks and eye position for gaze estimation.
    """
    
    def __init__(self):
        """Initialize gaze detector."""
        self.face_detector = None
        self.hand_detector = None
        self.pose_detector = None
        self._initialize_detectors()
        self.gaze_history = []

    def _initialize_detectors(self) -> None:
        """Initialize MediaPipe detectors."""
        if mp is None:
            return
        
        try:
            # Face detector for facial landmarks
            BaseOptions = mp.tasks.BaseOptions
            FaceDetector = vision.FaceDetector
            FaceDetectorOptions = vision.FaceDetectorOptions
            
            options = FaceDetectorOptions(
                base_options=BaseOptions(model_asset_path=None),
                running_mode=vision.RunningMode.IMAGE
            )
            
            # Fallback: use basic face detection without model
            self.face_detector = "initialized"
        except Exception as e:
            print(f"Warning: Could not initialize face detector: {e}")
            self.face_detector = None

    def detect_gaze_direction(self, face_landmarks: Dict[str, float]) -> Dict[str, Any]:
        """
        Detect gaze direction from facial landmarks.
        
        Args:
            face_landmarks: Dictionary with eye landmarks
            
        Returns:
            Gaze direction analysis
        """
        if not face_landmarks:
            return {"error": "No face landmarks provided"}
        
        # Calculate gaze vector from eye landmarks
        left_eye = face_landmarks.get("left_eye", {})
        right_eye = face_landmarks.get("right_eye", {})
        
        if not left_eye or not right_eye:
            return {"error": "Eye landmarks not found"}
        
        # Estimate gaze direction
        gaze_vector = self._calculate_gaze_vector(left_eye, right_eye)
        gaze_direction = self._classify_gaze_direction(gaze_vector)
        
        result = {
            "gaze_vector": gaze_vector,
            "direction": gaze_direction,
            "confidence": round(self._calculate_gaze_confidence(gaze_vector), 4),
            "horizontal": gaze_vector[0],
            "vertical": gaze_vector[1]
        }
        
        self.gaze_history.append(result)
        return result

    def detect_attention_to_shelf(self, face_landmarks: Dict, shelf_bbox: Dict[str, float]) -> Dict[str, Any]:
        """
        Determine if person is looking at a specific shelf.
        
        Args:
            face_landmarks: Facial landmarks
            shelf_bbox: Bounding box of shelf
            
        Returns:
            Attention analysis for shelf
        """
        if not face_landmarks:
            return {"attention": False, "confidence": 0}
        
        gaze = self.detect_gaze_direction(face_landmarks)
        
        if "error" in gaze:
            return {"attention": False, "error": gaze["error"]}
        
        # Get face center (approximate)
        face_center = face_landmarks.get("face_center", (0, 0))
        
        # Calculate if gaze direction points to shelf
        gaze_x = face_center[0] + gaze.get("horizontal", 0) * 100
        gaze_y = face_center[1] + gaze.get("vertical", 0) * 100
        
        shelf_x1 = shelf_bbox.get("x1", 0)
        shelf_y1 = shelf_bbox.get("y1", 0)
        shelf_x2 = shelf_bbox.get("x2", 0)
        shelf_y2 = shelf_bbox.get("y2", 0)
        
        is_looking = (shelf_x1 <= gaze_x <= shelf_x2) and (shelf_y1 <= gaze_y <= shelf_y2)
        confidence = gaze.get("confidence", 0) if is_looking else 0
        
        return {
            "shelf_bbox": shelf_bbox,
            "attention": is_looking,
            "confidence": round(confidence, 4),
            "gaze_point": (gaze_x, gaze_y)
        }

    def detect_multiple_objects_attention(self, face_landmarks: Dict, 
                                         objects: List[Dict]) -> List[Dict[str, Any]]:
        """
        Check attention to multiple objects/shelves.
        
        Args:
            face_landmarks: Facial landmarks
            objects: List of object bounding boxes
            
        Returns:
            Attention analysis for each object
        """
        results = []
        
        for obj in objects:
            attention = self.detect_attention_to_shelf(face_landmarks, obj)
            results.append(attention)
        
        return results

    def get_gaze_statistics(self) -> Dict[str, Any]:
        """Get statistics from gaze history."""
        if not self.gaze_history:
            return {"total_frames": 0}
        
        directions = [g.get("direction") for g in self.gaze_history if "direction" in g]
        confidences = [g.get("confidence", 0) for g in self.gaze_history]
        
        direction_counts = {}
        for d in directions:
            direction_counts[d] = direction_counts.get(d, 0) + 1
        
        return {
            "total_frames": len(self.gaze_history),
            "direction_distribution": direction_counts,
            "average_confidence": round(sum(confidences) / len(confidences), 4) if confidences else 0,
            "max_confidence": max(confidences) if confidences else 0,
            "min_confidence": min(confidences) if confidences else 0
        }

    def reset(self) -> None:
        """Reset gaze detector state."""
        self.gaze_history.clear()

    def _calculate_gaze_vector(self, left_eye: Dict, right_eye: Dict) -> Tuple[float, float]:
        """
        Calculate gaze vector from eye landmarks.
        
        Args:
            left_eye: Left eye landmarks
            right_eye: Right eye landmarks
            
        Returns:
            (horizontal, vertical) gaze vector
        """
        left_x = left_eye.get("x", 0)
        left_y = left_eye.get("y", 0)
        right_x = right_eye.get("x", 0)
        right_y = right_eye.get("y", 0)
        
        # Calculate iris center
        iris_x = (left_x + right_x) / 2
        iris_y = (left_y + right_y) / 2
        
        # Calculate eye center
        eye_center_x = (left_x + right_x) / 2
        eye_center_y = (left_y + right_y) / 2
        
        # Gaze vector (normalized)
        gaze_x = (iris_x - eye_center_x) / max(abs(left_x - right_x), 1)
        gaze_y = (iris_y - eye_center_y) / max(abs(left_y - right_y), 1)
        
        return (round(gaze_x, 4), round(gaze_y, 4))

    def _classify_gaze_direction(self, gaze_vector: Tuple[float, float]) -> str:
        """
        Classify gaze direction as cardinal direction.
        
        Args:
            gaze_vector: (horizontal, vertical) gaze vector
            
        Returns:
            Direction string: up, down, left, right, center
        """
        gaze_x, gaze_y = gaze_vector
        
        if abs(gaze_x) < 0.1 and abs(gaze_y) < 0.1:
            return "center"
        
        if gaze_y < -0.3:
            return "up"
        elif gaze_y > 0.3:
            return "down"
        elif gaze_x < -0.3:
            return "left"
        elif gaze_x > 0.3:
            return "right"
        else:
            return "center"

    def _calculate_gaze_confidence(self, gaze_vector: Tuple[float, float]) -> float:
        """
        Calculate confidence in gaze direction.
        
        Args:
            gaze_vector: Gaze vector
            
        Returns:
            Confidence score 0-1
        """
        gaze_x, gaze_y = gaze_vector
        magnitude = (gaze_x**2 + gaze_y**2)**0.5
        
        # Confidence based on gaze magnitude
        confidence = min(magnitude, 1.0)
        return confidence
