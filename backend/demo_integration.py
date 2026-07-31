"""
Integration example showing how to use all AI modules together.
Demonstrates: Detection, Tracking, Gaze Detection, and MediaPipe services.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.ai.detect import ObjectDetector
from app.ai.gaze import GazeDetector
from app.services.tracking_service import TrackingService
from app.services.mediapipe_service import MediaPipeService
from database.import_data import DatasetImporter


class RetailAttentionAnalyzer:
    """
    Complete retail consumer attention analysis pipeline.
    Integrates all AI components for comprehensive analysis.
    """
    
    def __init__(self):
        """Initialize all components."""
        self.detector = ObjectDetector()
        self.gaze_detector = GazeDetector()
        self.tracker = TrackingService()
        self.mediapipe = MediaPipeService()
        self.results = []
    
    def analyze_frame(self, frame, frame_number=0):
        """
        Analyze a single frame.
        
        Steps:
        1. Detect objects (people, items, baskets)
        2. Track objects across frames
        3. Detect facial landmarks
        4. Analyze gaze direction
        5. Calculate attention metrics
        """
        print(f"\n{'='*60}")
        print(f"Analyzing Frame #{frame_number}")
        print(f"{'='*60}")
        
        # Step 1: Object Detection
        print("\n1️⃣  Object Detection")
        detections = self.detector.detect_frame(frame, conf_threshold=0.25)
        print(f"   ✓ Detected {detections['total_detections']} objects")
        print(f"   Classes: {detections['classes']}")
        
        # Step 2: Tracking
        print("\n2️⃣  Object Tracking")
        tracking_result = self.tracker.update_tracks(detections['detections'])
        print(f"   ✓ Tracked {tracking_result['total_tracked']} objects")
        print(f"   Frame number: {tracking_result['frame_number']}")
        
        # Step 3: Face/Pose Detection
        print("\n3️⃣  Facial & Pose Detection (MediaPipe)")
        face_result = self.mediapipe.detect_face_landmarks(frame)
        pose_result = self.mediapipe.detect_pose(frame)
        print(f"   ✓ Face detected: {face_result.get('face_detected', False)}")
        print(f"   ✓ Pose detected: {pose_result.get('pose_detected', False)}")
        
        # Step 4: Gaze Detection
        print("\n4️⃣  Gaze Detection & Analysis")
        if face_result.get('success'):
            landmarks = face_result.get('landmarks', {})
            gaze = self.gaze_detector.detect_gaze_direction(landmarks)
            print(f"   ✓ Gaze direction: {gaze.get('direction', 'unknown')}")
            print(f"   ✓ Confidence: {gaze.get('confidence', 0)}")
        
        # Step 5: Statistics
        print("\n5️⃣  Analytics Summary")
        detection_summary = self.detector.get_detection_summary()
        tracking_stats = self.tracker.get_statistics()
        
        print(f"   📊 Detection Stats:")
        print(f"      - Total frames processed: {detection_summary['total_frames']}")
        print(f"      - Total objects detected: {detection_summary['total_detections']}")
        print(f"      - Average detections/frame: {detection_summary['average_detections']:.2f}")
        
        print(f"   📊 Tracking Stats:")
        print(f"      - Unique objects tracked: {tracking_stats['unique_objects']}")
        print(f"      - Avg track length: {tracking_stats['average_track_length']:.2f} frames")
        
        return {
            'frame_number': frame_number,
            'detections': detections,
            'tracking': tracking_result,
            'faces': face_result,
            'pose': pose_result,
            'gaze': gaze if face_result.get('success') else None
        }
    
    def analyze_batch(self, frames):
        """Analyze multiple frames."""
        print("\n" + "="*60)
        print("BATCH ANALYSIS")
        print("="*60)
        
        for i, frame in enumerate(frames):
            result = self.analyze_frame(frame, frame_number=i)
            self.results.append(result)
        
        return self.results
    
    def analyze_attention_on_shelf(self, shelf_bbox):
        """Analyze consumer attention on specific shelf."""
        print("\n" + "="*60)
        print("SHELF ATTENTION ANALYSIS")
        print("="*60)
        
        if self.results:
            latest = self.results[-1]
            face_landmarks = latest['faces'].get('landmarks', {})
            
            attention = self.gaze_detector.detect_attention_to_shelf(
                face_landmarks, 
                shelf_bbox
            )
            
            print(f"\n📍 Shelf Analysis:")
            print(f"   Shelf bbox: {shelf_bbox}")
            print(f"   Attention detected: {attention['attention']}")
            print(f"   Confidence: {attention['confidence']}")
            
            return attention
        
        return {"error": "No results to analyze"}
    
    def generate_heatmap(self):
        """Generate heatmap from tracking data."""
        print("\n" + "="*60)
        print("HEATMAP GENERATION")
        print("="*60)
        
        shelf_regions = [
            {"x1": 0, "y1": 0, "x2": 200, "y2": 300},
            {"x1": 200, "y1": 0, "x2": 400, "y2": 300},
            {"x1": 400, "y1": 0, "x2": 600, "y2": 300},
        ]
        
        heatmap = self.tracker.get_heatmap_data(shelf_regions)
        
        print(f"\n🔥 Heatmap Data:")
        print(f"   Total objects tracked: {heatmap['total_objects']}")
        print(f"   Total frames: {heatmap['total_frames']}")
        print(f"   Shelf attention distribution: {heatmap.get('shelf_attention', {})}")
        
        return heatmap


def demo_integration():
    """Run integration demo."""
    print("\n" + "="*70)
    print(" RETAIL CONSUMER ATTENTION MAPPING - INTEGRATION DEMO ".center(70))
    print("="*70)
    
    # Initialize analyzer
    analyzer = RetailAttentionAnalyzer()
    
    print("\n✓ All components initialized:")
    print("  - YOLO Object Detector")
    print("  - CentroidTracker")
    print("  - GazeDetector")
    print("  - MediaPipeService")
    print("  - TrackingService")
    
    # Create dummy frames for demo
    import numpy as np
    dummy_frames = [
        np.zeros((480, 640, 3), dtype=np.uint8) for _ in range(3)
    ]
    
    # Analyze batch
    analyzer.analyze_batch(dummy_frames)
    
    # Analyze shelf attention
    analyzer.analyze_attention_on_shelf({
        "x1": 100, "y1": 50, "x2": 300, "y2": 400
    })
    
    # Generate heatmap
    analyzer.generate_heatmap()
    
    print("\n" + "="*70)
    print(" INTEGRATION DEMO COMPLETE ".center(70))
    print("="*70)


def demo_dataset_loading():
    """Demonstrate dataset loading."""
    print("\n" + "="*70)
    print(" DATASET LOADING DEMO ".center(70))
    print("="*70)
    
    importer = DatasetImporter()
    
    print("\n📦 Seeding database with sample data...")
    summary = importer.seed_database()
    
    print("\n✓ Database seeding complete!")
    for key, count in summary.items():
        print(f"  {key}: {count} records")
    
    print("\n" + "="*70)


if __name__ == "__main__":
    # Run integration demo
    demo_integration()
    
    # Run dataset loading demo
    print("\n\n")
    demo_dataset_loading()
    
    print("\n✅ All demonstrations completed successfully!")
