import cv2

# 0 = your laptop's default webcam
# Or replace with a path to a sample video file, e.g. "sample_store_video.mp4"
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Could not open camera/video source.")
else:
    ret, frame = cap.read()
    if ret:
        print("Frame captured successfully. Frame shape:", frame.shape)
        cv2.imwrite("test_frame.jpg", frame)  # saves the captured frame as an image
    else:
        print("Camera opened, but failed to read a frame.")

cap.release()