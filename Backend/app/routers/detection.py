# backend/app/routers/detection.py
import cv2
import numpy as np
from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from ultralytics import YOLO
import base64

router = APIRouter()

# Load your custom fine-tuned RPC model
rpc_model = YOLO("best.pt")

@router.post("/detect-shelf-products")
async def detect_shelf_products(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    # Read uploaded file into OpenCV format
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if image is None:
        raise HTTPException(status_code=400, detail="Invalid image format")

    # Run inference using your RPC model
    results = rpc_model.predict(source=image, conf=0.25, verbose=False)
    
    detection_list = []
    item_counts = {}

    if results[0].boxes is not None:
        boxes = results[0].boxes
        for box in boxes:
            cls_id = int(box.cls[0].cpu().numpy())
            cls_name = rpc_model.names[cls_id]
            conf = float(box.conf[0].cpu().numpy())
            xyxy = box.xyxy[0].cpu().numpy().tolist()  # [x1, y1, x2, y2]

            # Collect product breakdown
            item_counts[cls_name] = item_counts.get(cls_name, 0) + 1
            
            detection_list.append({
                "class_id": cls_id,
                "label": cls_name,
                "confidence": round(conf, 2),
                "bbox": [round(coord, 1) for coord in xyxy]
            })

    # Render bounding boxes onto image and encode to Base64 for instant Frontend rendering
    annotated_img = results[0].plot()
    _, buffer = cv2.imencode(".jpg", annotated_img)
    base64_image = base64.b64encode(buffer).decode("utf-8")

    return JSONResponse(content={
        "success": True,
        "total_items": len(detection_list),
        "product_counts": item_counts,
        "detections": detection_list,
        "annotated_image": f"data:image/jpeg;base64,{base64_image}"
    })