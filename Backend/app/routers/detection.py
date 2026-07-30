from fastapi import APIRouter, UploadFile, File, Depends
from ultralytics import YOLO
import cv2
import numpy as np

from ..auth import get_current_user

router = APIRouter()

# Load the model once when the server starts (not on every request — much faster)
model = YOLO("yolov8n.pt")

@router.post("/detect")
async def detect_people(file: UploadFile = File(...), user=Depends(get_current_user)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    results = model(frame, classes=[0])  # class 0 = person
    person_count = len(results[0].boxes)

    return {"people_detected": person_count}