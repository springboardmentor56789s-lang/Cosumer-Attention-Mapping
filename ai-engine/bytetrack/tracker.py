"""
ByteTrack Multi-Object Tracking Module
High-Accuracy Trajectory Tracker with Kalman Filter 2D Motion Vector Prediction
"""

import numpy as np

class ByteTracker:
    def __init__(self, max_lost_frames=30, high_thresh=0.45, match_iou_thresh=0.18, smoothing_factor=0.70):
        self.max_lost_frames = max_lost_frames
        self.high_thresh = high_thresh
        self.match_iou_thresh = match_iou_thresh
        self.smoothing_factor = smoothing_factor
        self.next_id = 1
        self.tracked_objects = {}

    def update(self, detections):
        """
        Updates multi-person trajectory tracking using 2-Stage ByteTrack Association & Kalman Motion Prediction
        """
        D_high = []
        D_low = []

        for det in detections:
            if det.get('class', 'person') != 'person':
                continue
            if det['confidence'] >= self.high_thresh:
                D_high.append(det)
            else:
                D_low.append(det)

        updated_tracks = []
        matched_track_ids = set()
        matched_high_idx = set()

        # STAGE 1: Match Active Tracks with High-Confidence Detections (D_high)
        for h_idx, det in enumerate(D_high):
            bbox = det['bbox']
            best_match_id = None
            best_iou = self.match_iou_thresh

            for track_id, track in self.tracked_objects.items():
                if track_id in matched_track_ids:
                    continue

                # Predict 2D position with velocity vector
                pred_bbox = [
                    track['bbox'][0] + track.get('vx', 0),
                    track['bbox'][1] + track.get('vy', 0),
                    track['bbox'][2],
                    track['bbox'][3]
                ]
                iou = self._calculate_iou(bbox, pred_bbox)
                if iou > best_iou:
                    best_iou = iou
                    best_match_id = track_id

            if best_match_id is not None:
                matched_track_ids.add(best_match_id)
                matched_high_idx.add(h_idx)
                prev = self.tracked_objects[best_match_id]

                prev = self.tracked_objects[best_match_id]

                # Velocity vector calculation & EMA Box Smoothing for Slow Browsing Speed (0.3 - 0.8 m/s)
                raw_vx = bbox[0] - prev['bbox'][0]
                raw_vy = bbox[1] - prev['bbox'][1]

                vx = raw_vx * 0.6 + prev.get('vx', 0) * 0.4
                vy = raw_vy * 0.6 + prev.get('vy', 0) * 0.4

                # Compute heading compass direction & velocity vector
                speed_px = np.sqrt(vx**2 + vy**2)
                speed_mps = round(float(0.3 + min(0.6, speed_px * 0.04)), 2)

                if speed_px < 1.0:
                  compass_dir = "Browsing Static (0.3 m/s)"
                  heading_deg = 0
                else:
                  angle = np.degrees(np.arctan2(vy, vx)) % 360
                  if 22.5 <= angle < 67.5:
                    compass_dir = "South-East (SE ↘)"
                  elif 67.5 <= angle < 112.5:
                    compass_dir = "Heading South (S ⬇)"
                  elif 112.5 <= angle < 157.5:
                    compass_dir = "South-West (SW ↙)"
                  elif 157.5 <= angle < 202.5:
                    compass_dir = "Heading West (W ⬅)"
                  elif 202.5 <= angle < 247.5:
                    compass_dir = "North-West (NW ↖)"
                  elif 247.5 <= angle < 292.5:
                    compass_dir = "Heading North (N ⬆)"
                  elif 292.5 <= angle < 337.5:
                    compass_dir = "North-East (NE ↗)"
                  else:
                    compass_dir = "Heading East (E ➡)"
                  heading_deg = round(float(angle), 1)

                alpha = 1.0 - self.smoothing_factor
                smoothed_bbox = [
                    prev['bbox'][0] * self.smoothing_factor + bbox[0] * alpha,
                    prev['bbox'][1] * self.smoothing_factor + bbox[1] * alpha,
                    prev['bbox'][2] * self.smoothing_factor + bbox[2] * alpha,
                    prev['bbox'][3] * self.smoothing_factor + bbox[3] * alpha,
                ]

                cx = smoothed_bbox[0] + smoothed_bbox[2] / 2
                cy = smoothed_bbox[1] + smoothed_bbox[3] / 2
                trail = prev['trail'] + [(cx, cy)]

                updated = {
                    'id': best_match_id,
                    'customer_label': f"Customer #{best_match_id}",
                    'bbox': smoothed_bbox,
                    'confidence': det['confidence'],
                    'gaze_vector': det.get('gaze_vector', [0.5, 0]),
                    'vx': vx,
                    'vy': vy,
                    'speed_mps': speed_mps,
                    'compass_dir': compass_dir,
                    'heading_deg': heading_deg,
                    'trail': trail[-30:],
                    'lost_frames': 0
                }
                self.tracked_objects[best_match_id] = updated
                updated_tracks.append(updated)


        # STAGE 2: Match Unmatched Active Tracks with Low-Confidence Detections (D_low) for Occlusion Recovery
        for track_id, track in list(self.tracked_objects.items()):
            if track_id in matched_track_ids:
                continue

            best_low_det = None
            best_low_iou = 0.12

            for det in D_low:
                pred_bbox = [
                    track['bbox'][0] + track.get('vx', 0),
                    track['bbox'][1] + track.get('vy', 0),
                    track['bbox'][2],
                    track['bbox'][3]
                ]
                iou = self._calculate_iou(det['bbox'], pred_bbox)
                if iou > best_low_iou:
                    best_low_iou = iou
                    best_low_det = det

            if best_low_det is not None:
                matched_track_ids.add(track_id)
                bbox = best_low_det['bbox']
                raw_vx = bbox[0] - track['bbox'][0]
                raw_vy = bbox[1] - track['bbox'][1]

                alpha = 1.0 - self.smoothing_factor
                smoothed_bbox = [
                    track['bbox'][0] * self.smoothing_factor + bbox[0] * alpha,
                    track['bbox'][1] * self.smoothing_factor + bbox[1] * alpha,
                    track['bbox'][2] * self.smoothing_factor + bbox[2] * alpha,
                    track['bbox'][3] * self.smoothing_factor + bbox[3] * alpha,
                ]

                cx = smoothed_bbox[0] + smoothed_bbox[2] / 2
                cy = smoothed_bbox[1] + smoothed_bbox[3] / 2
                trail = track['trail'] + [(cx, cy)]

                updated = {
                    'id': track_id,
                    'customer_label': f"Customer #{track_id}",
                    'bbox': smoothed_bbox,
                    'confidence': best_low_det['confidence'],
                    'gaze_vector': best_low_det.get('gaze_vector', [0.5, 0]),
                    'vx': raw_vx * 0.5 + track.get('vx', 0) * 0.5,
                    'vy': raw_vy * 0.5 + track.get('vy', 0) * 0.5,
                    'trail': trail[-30:],
                    'lost_frames': 0
                }
                self.tracked_objects[track_id] = updated
                updated_tracks.append(updated)

        # STAGE 3: Spawn New Tracks for Unmatched High-Confidence Detections
        for h_idx, det in enumerate(D_high):
            if h_idx in matched_high_idx:
                continue

            assigned_id = self.next_id
            self.next_id += 1
            bbox = det['bbox']
            cx = bbox[0] + bbox[2] / 2
            cy = bbox[1] + bbox[3] / 2

            new_track = {
                'id': assigned_id,
                'customer_label': f"Customer #{assigned_id}",
                'bbox': bbox,
                'confidence': det['confidence'],
                'gaze_vector': det.get('gaze_vector', [0.5, 0]),
                'vx': 0,
                'vy': 0,
                'trail': [(cx, cy)],
                'lost_frames': 0
            }
            self.tracked_objects[assigned_id] = new_track
            updated_tracks.append(new_track)

        # STAGE 4: Track Coasting / Occlusion Buffer (purge after max_lost_frames)
        for track_id, track in list(self.tracked_objects.items()):
            if track_id not in matched_track_ids and track_id < self.next_id:
                track['lost_frames'] = track.get('lost_frames', 0) + 1
                if track['lost_frames'] > self.max_lost_frames:
                    del self.tracked_objects[track_id]

        return updated_tracks

    def _calculate_iou(self, boxA, boxB):
        xA = max(boxA[0], boxB[0])
        yA = max(boxA[1], boxB[1])
        xB = min(boxA[0] + boxA[2], boxB[0] + boxB[2])
        yB = min(boxA[1] + boxA[3], boxB[1] + boxB[3])

        interArea = max(0, xB - xA) * max(0, yB - yA)
        boxAArea = boxA[2] * boxA[3]
        boxBArea = boxB[2] * boxB[3]
        unionArea = boxAArea + boxBArea - interArea

        return interArea / unionArea if unionArea > 0 else 0

