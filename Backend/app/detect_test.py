from ultralytics import YOLO
import cv2

model = YOLO("yolov8n.pt")  # auto-downloads pretrained weights, trained on COCO (includes "person")

cap = cv2.VideoCapture("app/sample_data/store_video.mp4")

frame_count = 0
while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    results = model(frame, classes=[0])  # class 0 = person only
    annotated = results[0].plot()

    cv2.imwrite(f"app/sample_data/detected_frame_{frame_count}.jpg", annotated)
    frame_count += 1
    if frame_count >= 5:  # just grab first 5 frames for a quick test
        break

cap.release()
print(f"Done — {frame_count} frames processed with person detection.")