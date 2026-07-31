"""
Tracking service for multi-object tracking and trajectory analysis.
Manages tracking across frames and provides trajectory analytics.
"""

from typing import Dict, List, Tuple, Optional, Any
from datetime import datetime
from app.ai.tracker import CentroidTracker


class TrackingService:
    """
    High-level tracking service managing multiple trackers
    and providing trajectory analytics.
    """
    
    def __init__(self, max_distance: float = 50, max_disappeared: int = 30):
        """
        Initialize tracking service.
        
        Args:
            max_distance: Maximum distance for object matching
            max_disappeared: Max frames before removing object
        """
        self.tracker = CentroidTracker(max_distance=max_distance, 
                                      max_disappeared=max_disappeared)
        self.frame_count = 0
        self.trajectory_data = {}
        self.attention_metrics = {}
        self.start_time = datetime.now()

    def update_tracks(self, detections: List[Dict[str, float]]) -> Dict[int, Dict[str, Any]]:
        """
        Update tracks with new detections.
        
        Args:
            detections: List of detection dictionaries with bounding boxes
            
        Returns:
            Tracking results for current frame
        """
        self.frame_count += 1
        
        tracked_objects = self.tracker.update(detections)
        
        # Store trajectory data
        for obj_id, obj_info in tracked_objects.items():
            if obj_id not in self.trajectory_data:
                self.trajectory_data[obj_id] = {
                    "id": obj_id,
                    "start_frame": self.frame_count,
                    "centroids": [],
                    "appearance_count": 0,
                    "last_seen_frame": self.frame_count
                }
            
            self.trajectory_data[obj_id]["centroids"].append(obj_info["centroid"])
            self.trajectory_data[obj_id]["appearance_count"] += 1
            self.trajectory_data[obj_id]["last_seen_frame"] = self.frame_count
        
        return {
            "frame_number": self.frame_count,
            "timestamp": datetime.now().isoformat(),
            "tracked_objects": tracked_objects,
            "total_tracked": len(tracked_objects)
        }

    def get_trajectory(self, object_id: int) -> Dict[str, Any]:
        """
        Get trajectory for a specific object.
        
        Args:
            object_id: ID of the object
            
        Returns:
            Trajectory data
        """
        if object_id not in self.trajectory_data:
            return {"error": f"Object {object_id} not found"}
        
        traj = self.trajectory_data[object_id]
        centroids = traj["centroids"]
        
        return {
            "object_id": object_id,
            "start_frame": traj["start_frame"],
            "last_seen_frame": traj["last_seen_frame"],
            "duration_frames": traj["last_seen_frame"] - traj["start_frame"],
            "appearance_count": traj["appearance_count"],
            "total_points": len(centroids),
            "centroids": centroids,
            "distance_traveled": self._calculate_path_length(centroids)
        }

    def get_all_trajectories(self) -> Dict[int, Dict[str, Any]]:
        """Get all trajectories."""
        trajectories = {}
        for obj_id in self.trajectory_data.keys():
            trajectories[obj_id] = self.get_trajectory(obj_id)
        return trajectories

    def analyze_attention(self, object_id: int, shelf_regions: List[Dict[str, float]]) -> Dict[str, Any]:
        """
        Analyze if object is attending to specific regions.
        
        Args:
            object_id: ID of the object
            shelf_regions: List of shelf region bounding boxes
            
        Returns:
            Attention analysis
        """
        traj = self.get_trajectory(object_id)
        if "error" in traj:
            return traj
        
        centroids = traj["centroids"]
        attention_results = {
            "object_id": object_id,
            "shelf_attention": {}
        }
        
        for shelf_idx, shelf in enumerate(shelf_regions):
            points_in_region = self._count_points_in_region(centroids, shelf)
            attention_duration = points_in_region / max(1, len(centroids)) * 100
            
            attention_results["shelf_attention"][shelf_idx] = {
                "shelf_id": shelf_idx,
                "attention_percentage": round(attention_duration, 2),
                "frames_in_region": points_in_region,
                "shelf_bbox": shelf
            }
        
        return attention_results

    def get_heatmap_data(self, shelf_regions: Optional[List[Dict]] = None) -> Dict[str, Any]:
        """
        Generate heatmap data from all trajectories.
        
        Args:
            shelf_regions: Optional shelf region definitions
            
        Returns:
            Heatmap data showing attention distribution
        """
        heatmap = {
            "total_objects": len(self.trajectory_data),
            "total_frames": self.frame_count,
            "objects_data": []
        }
        
        for obj_id, traj_data in self.trajectory_data.items():
            heatmap["objects_data"].append({
                "object_id": obj_id,
                "trajectory_length": len(traj_data["centroids"]),
                "appearance_count": traj_data["appearance_count"],
                "duration": traj_data["last_seen_frame"] - traj_data["start_frame"]
            })
        
        if shelf_regions:
            heatmap["shelf_attention"] = self._calculate_shelf_heatmap(shelf_regions)
        
        return heatmap

    def get_statistics(self) -> Dict[str, Any]:
        """Get overall tracking statistics."""
        if not self.trajectory_data:
            return {
                "total_frames": self.frame_count,
                "unique_objects": 0,
                "average_track_length": 0
            }
        
        track_lengths = [traj["appearance_count"] for traj in self.trajectory_data.values()]
        
        return {
            "total_frames": self.frame_count,
            "unique_objects": len(self.trajectory_data),
            "average_track_length": sum(track_lengths) / len(track_lengths),
            "max_track_length": max(track_lengths),
            "min_track_length": min(track_lengths),
            "elapsed_time": str(datetime.now() - self.start_time)
        }

    def reset(self) -> None:
        """Reset tracking state."""
        self.tracker.reset()
        self.frame_count = 0
        self.trajectory_data.clear()
        self.attention_metrics.clear()
        self.start_time = datetime.now()

    def _calculate_path_length(self, centroids: List[Tuple[float, float]]) -> float:
        """Calculate total distance traveled."""
        if len(centroids) < 2:
            return 0.0
        
        total_distance = 0.0
        for i in range(len(centroids) - 1):
            p1, p2 = centroids[i], centroids[i + 1]
            distance = ((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2)**0.5
            total_distance += distance
        
        return round(total_distance, 2)

    def _count_points_in_region(self, points: List[Tuple[float, float]], 
                               region: Dict[str, float]) -> int:
        """Count how many points are inside a region."""
        count = 0
        x1, y1 = region.get("x1", 0), region.get("y1", 0)
        x2, y2 = region.get("x2", 0), region.get("y2", 0)
        
        for px, py in points:
            if x1 <= px <= x2 and y1 <= py <= y2:
                count += 1
        
        return count

    def _calculate_shelf_heatmap(self, shelf_regions: List[Dict]) -> Dict[int, int]:
        """Calculate attention distribution across shelves."""
        heatmap = {i: 0 for i in range(len(shelf_regions))}
        
        for traj_data in self.trajectory_data.values():
            for shelf_idx, shelf in enumerate(shelf_regions):
                count = self._count_points_in_region(traj_data["centroids"], shelf)
                heatmap[shelf_idx] += count
        
        return heatmap
