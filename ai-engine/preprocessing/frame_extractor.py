"""
OpenCV Frame Extraction & Video Preprocessing Module
Milestone 2 Task 4: Extract frames, resize, convert color spaces, and generate thumbnails
"""

import os
import cv2
import numpy as np

class FrameExtractor:
    def __init__(self, target_width=1280, target_height=720):
        self.target_width = target_width
        self.target_height = target_height

    def extract_frames(self, video_path, sample_rate=1):
        """
        Extract processable frames from an MP4/AVI/MOV video file using OpenCV
        """
        if not os.path.exists(video_path):
            raise FileNotFoundError(f"Video file not found: {video_path}")

        cap = cv2.VideoCapture(video_path)
        frames = []
        frame_idx = 0

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            if frame_idx % sample_rate == 0:
                # Resize and BGR -> RGB conversion
                resized = cv2.resize(frame, (self.target_width, self.target_height))
                rgb_frame = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB)
                frames.append((frame_idx, rgb_frame))

            frame_idx += 1

        cap.release()
        return frames

    def generate_thumbnail(self, video_path, output_path):
        """
        Generate a thumbnail image for video upload preview
        """
        cap = cv2.VideoCapture(video_path)
        ret, frame = cap.read()
        if ret:
            resized = cv2.resize(frame, (480, 270))
            cv2.imwrite(output_path, resized)
        cap.release()
        return output_path
