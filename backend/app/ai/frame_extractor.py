import cv2
import os


def extract_frames(video_path, output_folder):
    """
    Extract frames from a video and save them as images.

    Args:
        video_path (str): Path of the input video
        output_folder (str): Folder where frames will be saved
    """

    os.makedirs(output_folder, exist_ok=True)

    cap = cv2.VideoCapture(video_path)

    frame_count = 0

    while True:

        success, frame = cap.read()

        if not success:
            break

        frame_name = os.path.join(
            output_folder,
            f"frame_{frame_count:05d}.jpg"
        )

        cv2.imwrite(frame_name, frame)

        frame_count += 1

    cap.release()

    return frame_count