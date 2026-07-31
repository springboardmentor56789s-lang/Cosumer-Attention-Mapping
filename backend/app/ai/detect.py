"""
YOLO-based detection module for consumer attention mapping.
Handles object and person detection from video frames.
"""

from typing import List, Dict, Any, Optional
import cv2
from app.services.yolo_service import YOLOService


class ObjectDetector:
    """Handles object detection using YOLO model."""
    
    def __init__(self, model_name: str = "yolov8n.pt", device: str = "cpu"):
        """
        Initialize the object detector.
        
        Args:
            model_name: YOLO model name (default: yolov8n.pt)
            device: Device to run on ('cpu' or 'cuda')
        """
        self.yolo_service = YOLOService(model_name=model_name, device=device)
        self.detection_history = []

    def detect_frame(self, frame: Any, conf_threshold: float = 0.25) -> Dict[str, Any]:
        """
        Detect objects in a frame.
        
        Args:
            frame: Input frame (numpy array)
            conf_threshold: Confidence threshold for detection
            
        Returns:
            Dict containing detections with metadata
        """
        detections = self.yolo_service.predict_frame(frame, conf_threshold=conf_threshold)
        
        result = {
            "success": True,
            "frame_shape": frame.shape if hasattr(frame, 'shape') else None,
            "total_detections": len(detections),
            "detections": detections,
            "classes": list(set(d["class_name"] for d in detections))
        }
        
        self.detection_history.append(result)
        return result

    def detect_people(self, frame: Any, conf_threshold: float = 0.25) -> List[Dict[str, Any]]:
        """
        Detect only people in a frame.
        
        Args:
            frame: Input frame
            conf_threshold: Confidence threshold
            
        Returns:
            List of person detections
        """
        detections = self.yolo_service.predict_frame(frame, conf_threshold=conf_threshold)
        people = [d for d in detections if d["class_name"].lower() == "person"]
        return people

    def detect_from_rtsp(self, rtsp_url: str, conf_threshold: float = 0.25) -> Dict[str, Any]:
        """
        Process RTSP stream and return detections.
        
        Args:
            rtsp_url: RTSP stream URL
            conf_threshold: Confidence threshold
            
        Returns:
            Detection results
        """
        try:
            detections = self.yolo_service.process_rtsp_url(rtsp_url, conf_threshold=conf_threshold)
            return {
                "success": True,
                "rtsp_url": rtsp_url,
                "detections": detections,
                "total_detections": len(detections)
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    def filter_detections(self, detections: List[Dict], class_names: List[str] = None, 
                         min_confidence: float = 0.5) -> List[Dict]:
        """
        Filter detections by class and confidence.
        
        Args:
            detections: List of detection dictionaries
            class_names: List of class names to filter (None = all)
            min_confidence: Minimum confidence threshold
            
        Returns:
            Filtered detections
        """
        filtered = detections
        
        if class_names:
            filtered = [d for d in filtered if d["class_name"] in class_names]
        
        if min_confidence > 0:
            filtered = [d for d in filtered if d["confidence"] >= min_confidence]
        
        return filtered

    def get_detection_summary(self) -> Dict[str, Any]:
        """Get summary of detection history."""
        if not self.detection_history:
            return {"total_frames": 0, "average_detections": 0}
        
        total_detections = sum(d["total_detections"] for d in self.detection_history)
        
        return {
            "total_frames": len(self.detection_history),
            "total_detections": total_detections,
            "average_detections": total_detections / len(self.detection_history),
            "classes_detected": list(set(
                c for d in self.detection_history for c in d.get("classes", [])
            ))
        }
