"""
Multi-object tracking using centroid tracking algorithm.
Simple yet effective tracking for retail consumer attention mapping.
"""

from typing import Dict, List, Tuple, Optional
from collections import OrderedDict
import numpy as np


class CentroidTracker:
    """
    Simple centroid-based object tracker.
    
    This tracker uses euclidean distance between centroids
    to associate detections across frames.
    """
    
    def __init__(self, max_distance: float = 50, max_disappeared: int = 30):
        """
        Initialize the centroid tracker.
        
        Args:
            max_distance: Maximum distance between centroids for matching
            max_disappeared: Max frames before removing object
        """
        self.next_object_id = 0
        self.objects = OrderedDict()
        self.disappeared = OrderedDict()
        self.max_distance = max_distance
        self.max_disappeared = max_disappeared

    def register(self, centroid: Tuple[float, float]) -> int:
        """
        Register a new object.
        
        Args:
            centroid: (x, y) coordinates of centroid
            
        Returns:
            Object ID
        """
        self.objects[self.next_object_id] = centroid
        self.disappeared[self.next_object_id] = 0
        self.next_object_id += 1
        return self.next_object_id - 1

    def deregister(self, object_id: int) -> None:
        """
        Remove an object.
        
        Args:
            object_id: ID of object to remove
        """
        del self.objects[object_id]
        del self.disappeared[object_id]

    def update(self, detections: List[Dict]) -> Dict[int, Dict]:
        """
        Update tracker with new detections.
        
        Args:
            detections: List of detection dicts with keys:
                        'x1', 'y1', 'x2', 'y2' (bounding box)
                        
        Returns:
            Dictionary of tracked objects with their info
        """
        if len(detections) == 0:
            # No detections - increment disappeared counters
            for object_id in list(self.disappeared.keys()):
                self.disappeared[object_id] += 1
                
                if self.disappeared[object_id] > self.max_disappeared:
                    self.deregister(object_id)
            
            return self.objects
        
        # Extract centroids from detections
        input_centroids = []
        for detection in detections:
            x1, y1 = detection.get("x1"), detection.get("y1")
            x2, y2 = detection.get("x2"), detection.get("y2")
            
            if x1 is not None and y1 is not None and x2 is not None and y2 is not None:
                cx = (x1 + x2) / 2
                cy = (y1 + y2) / 2
                input_centroids.append((cx, cy))
        
        input_centroids = np.array(input_centroids)
        
        # If no objects exist, register all detections
        if len(self.objects) == 0:
            for centroid in input_centroids:
                self.register(tuple(centroid))
            
            return self.objects
        
        # Match detections to tracked objects
        tracked_centroids = np.array([self.objects[oid] for oid in self.objects.keys()])
        d = self._distance_matrix(tracked_centroids, input_centroids)
        
        rows, cols = np.where(d <= self.max_distance)
        
        used_rows = set()
        used_cols = set()
        
        for row, col in zip(rows, cols):
            if row in used_rows or col in used_cols:
                continue
            
            if d[row, col] > self.max_distance:
                continue
            
            object_id = list(self.objects.keys())[row]
            self.objects[object_id] = tuple(input_centroids[col])
            self.disappeared[object_id] = 0
            
            used_rows.add(row)
            used_cols.add(col)
        
        # Handle unmatched objects
        unused_rows = set(range(0, d.shape[0])).difference(used_rows)
        for row in unused_rows:
            object_id = list(self.objects.keys())[row]
            self.disappeared[object_id] += 1
            
            if self.disappeared[object_id] > self.max_disappeared:
                self.deregister(object_id)
        
        # Register unmatched detections
        unused_cols = set(range(0, d.shape[1])).difference(used_cols)
        if len(self.objects) == 0:
            for col in unused_cols:
                self.register(tuple(input_centroids[col]))
        else:
            for col in unused_cols:
                self.register(tuple(input_centroids[col]))
        
        return self._get_objects_with_info(detections)

    def reset(self) -> None:
        """Reset tracker state."""
        self.next_object_id = 0
        self.objects.clear()
        self.disappeared.clear()

    def _distance_matrix(self, centroids1: np.ndarray, centroids2: np.ndarray) -> np.ndarray:
        """
        Calculate euclidean distances between two sets of centroids.
        
        Args:
            centroids1: Array of shape (N, 2)
            centroids2: Array of shape (M, 2)
            
        Returns:
            Distance matrix of shape (N, M)
        """
        if len(centroids1) == 0 or len(centroids2) == 0:
            return np.zeros((len(centroids1), len(centroids2)))
        
        distances = np.zeros((len(centroids1), len(centroids2)))
        
        for i in range(len(centroids1)):
            for j in range(len(centroids2)):
                dx = centroids1[i][0] - centroids2[j][0]
                dy = centroids1[i][1] - centroids2[j][1]
                distances[i][j] = np.sqrt(dx**2 + dy**2)
        
        return distances

    def _get_objects_with_info(self, detections: List[Dict]) -> Dict[int, Dict]:
        """
        Get objects with additional info from detections.
        
        Args:
            detections: List of detection dictionaries
            
        Returns:
            Dictionary mapping object_id to info dict
        """
        result = {}
        
        for obj_id, centroid in self.objects.items():
            result[obj_id] = {
                "id": obj_id,
                "centroid": centroid,
                "disappeared": self.disappeared[obj_id],
                "status": "active"
            }
        
        return result
