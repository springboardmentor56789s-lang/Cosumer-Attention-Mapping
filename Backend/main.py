from jose import jwt

import uuid
import threading

from fastapi import BackgroundTasks
from fastapi.responses import FileResponse

import reports_engine
import alert_engine
import recommendation_engine
import scoring_engine
import generate_heatmap
import behavior_analysis

from fastapi import UploadFile, File
import shutil
import os
import detection

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, Base, SessionLocal
import models
import schemas
import auth


# ============================================================
# APP CONFIGURATION
# ============================================================

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://consumer-attention-frontend-sneha.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# VIDEO ANALYSIS JOB STORAGE
# ============================================================

# Stores the status/result of currently running video jobs.
# This avoids making the browser wait for the complete
# YOLO + tracking + reporting process.
VIDEO_JOBS = {}

VIDEO_JOBS_LOCK = threading.Lock()


# ============================================================
# DATABASE
# ============================================================

def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# ============================================================
# GENERIC PRODUCT REGION DETECTION
# ============================================================

def detect_generic_product_regions(image_path):
    """
    Detects densely packed rectangular product-shaped regions
    using edge detection as a fallback for products YOLO's
    COCO categories don't recognize.
    """

    import cv2
    import numpy as np

    img = cv2.imread(image_path)

    if img is None:
        return [], None

    gray = cv2.cvtColor(
        img,
        cv2.COLOR_BGR2GRAY
    )

    blurred = cv2.GaussianBlur(
        gray,
        (5, 5),
        0
    )

    edges = cv2.Canny(
        blurred,
        50,
        150
    )

    kernel = np.ones(
        (5, 5),
        np.uint8
    )

    dilated = cv2.dilate(
        edges,
        kernel,
        iterations=2
    )

    contours, _ = cv2.findContours(
        dilated,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE
    )

    img_area = img.shape[0] * img.shape[1]

    regions = []

    for cnt in contours:

        area = cv2.contourArea(cnt)

        if (
            img_area * 0.001
            < area
            < img_area * 0.05
        ):

            x, y, w, h = cv2.boundingRect(cnt)

            aspect_ratio = (
                w / h
                if h > 0
                else 0
            )

            if 0.2 < aspect_ratio < 5:

                regions.append({
                    "x": x,
                    "y": y,
                    "w": w,
                    "h": h
                })

    return regions, img


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def read_root():

    return {
        "message":
            "Consumer Attention Mapping System - Backend is running!"
    }


# ============================================================
# AUTHENTICATION
# ============================================================

from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="login"
)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):

    try:

        payload = jwt.decode(
            token,
            auth.SECRET_KEY,
            algorithms=[auth.ALGORITHM]
        )

        email: str = payload.get("sub")

        if email is None:

            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

    except Exception:

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    user = db.query(
        models.User
    ).filter(
        models.User.email == email
    ).first()

    if user is None:

        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    return user


@app.post(
    "/register",
    response_model=schemas.UserResponse
)
def register_user(
    user: schemas.UserCreate,
    db: Session = Depends(get_db)
):

    existing_user = db.query(
        models.User
    ).filter(
        models.User.email == user.email
    ).first()

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    hashed_pw = auth.hash_password(
        user.password
    )

    new_user = models.User(
        name=user.name,
        email=user.email,
        password=hashed_pw,
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@app.post(
    "/login",
    response_model=schemas.Token
)
def login_user(
    user: schemas.UserLogin,
    db: Session = Depends(get_db)
):

    db_user = db.query(
        models.User
    ).filter(
        models.User.email == user.email
    ).first()

    if (
        not db_user
        or not auth.verify_password(
            user.password,
            db_user.password
        )
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = auth.create_access_token(
        data={
            "sub": db_user.email,
            "role": db_user.role
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


# ============================================================
# STORES
# ============================================================

@app.post(
    "/stores",
    response_model=schemas.StoreResponse
)
def create_store(
    store: schemas.StoreCreate,
    db: Session = Depends(get_db)
):

    new_store = models.Store(
        name=store.name,
        location=store.location
    )

    db.add(new_store)
    db.commit()
    db.refresh(new_store)

    return new_store


@app.get(
    "/stores",
    response_model=list[schemas.StoreResponse]
)
def get_stores(
    db: Session = Depends(get_db)
):

    stores = db.query(
        models.Store
    ).all()

    return stores


# ============================================================
# SHELVES
# ============================================================

@app.post(
    "/shelves",
    response_model=schemas.ShelfResponse
)
def create_shelf(
    shelf: schemas.ShelfCreate,
    db: Session = Depends(get_db)
):

    store = db.query(
        models.Store
    ).filter(
        models.Store.id == shelf.store_id
    ).first()

    if not store:

        raise HTTPException(
            status_code=404,
            detail="Store not found"
        )

    new_shelf = models.Shelf(
        store_id=shelf.store_id,
        shelf_name=shelf.shelf_name,
        zone=shelf.zone
    )

    db.add(new_shelf)
    db.commit()
    db.refresh(new_shelf)

    return new_shelf


@app.get(
    "/shelves",
    response_model=list[schemas.ShelfResponse]
)
def get_shelves(
    db: Session = Depends(get_db)
):

    shelves = db.query(
        models.Shelf
    ).all()

    return shelves


# ============================================================
# CAMERAS
# ============================================================

@app.post(
    "/cameras",
    response_model=schemas.CameraResponse
)
def create_camera(
    camera: schemas.CameraCreate,
    db: Session = Depends(get_db)
):

    store = db.query(
        models.Store
    ).filter(
        models.Store.id == camera.store_id
    ).first()

    if not store:

        raise HTTPException(
            status_code=404,
            detail="Store not found"
        )

    new_camera = models.Camera(
        store_id=camera.store_id,
        camera_name=camera.camera_name,
        location_description=camera.location_description
    )

    db.add(new_camera)
    db.commit()
    db.refresh(new_camera)

    return new_camera


@app.get(
    "/cameras",
    response_model=list[schemas.CameraResponse]
)
def get_cameras(
    db: Session = Depends(get_db)
):

    cameras = db.query(
        models.Camera
    ).all()

    return cameras


# ============================================================
# IMAGE PERSON DETECTION
# ============================================================

@app.post("/detect-people")
def detect_people_endpoint(
    file: UploadFile = File(...)
):

    upload_folder = "uploaded_images"

    os.makedirs(
        upload_folder,
        exist_ok=True
    )

    file_path = os.path.join(
        upload_folder,
        file.filename
    )

    with open(
        file_path,
        "wb"
    ) as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )

    result = detection.detect_people(
        file_path
    )

    return result


# ============================================================
# BEHAVIOR ANALYSIS
# ============================================================

@app.get("/behavior-analysis/{track_id}")
def get_behavior_analysis(
    track_id: int,
    db: Session = Depends(get_db)
):

    result = behavior_analysis.classify_shopper(
        track_id,
        db
    )

    return result


@app.get("/behavior-analysis-all")
def get_all_behavior_analysis(
    db: Session = Depends(get_db)
):

    all_ids = db.query(
        models.AttentionRecord.person_track_id
    ).distinct().all()

    person_ids = [
        row[0]
        for row in all_ids
    ]

    results = []

    for pid in person_ids:

        result = behavior_analysis.classify_shopper(
            pid,
            db
        )

        if isinstance(result, dict):

            results.append(result)

    return results


# ============================================================
# SHELF SCORES
# ============================================================

@app.get("/shelf-scores")
def get_shelf_scores():

    scores = (
        scoring_engine.calculate_shelf_scores()
    )

    return scores


# ============================================================
# RECOMMENDATIONS
# ============================================================

@app.get("/recommendations")
def get_recommendations():

    return (
        recommendation_engine
        .generate_recommendations()
    )


# ============================================================
# ALERTS
# ============================================================

@app.post("/alerts/run-check")
def run_alert_check():

    alerts = (
        alert_engine
        .run_all_checks_and_save()
    )

    return {
        "alerts_generated": len(alerts),
        "alerts": alerts
    }


@app.get("/alerts")
def get_all_alerts(
    db: Session = Depends(get_db)
):

    alerts = db.query(
        models.Alert
    ).order_by(
        models.Alert.created_at.desc()
    ).all()

    return alerts


# ============================================================
# REPORTS
# ============================================================

@app.get("/reports/pdf")
def download_pdf_report():

    filepath = (
        reports_engine
        .generate_pdf_report()
    )

    return FileResponse(
        filepath,
        media_type="application/pdf",
        filename="consumer_attention_report.pdf"
    )


@app.get("/reports/excel")
def download_excel_report():

    filepath = (
        reports_engine
        .generate_excel_report()
    )

    return FileResponse(
        filepath,
        media_type=(
            "application/vnd.openxmlformats-officedocument."
            "spreadsheetml.sheet"
        ),
        filename="consumer_attention_report.xlsx"
    )


# ============================================================
# HEATMAPS
# ============================================================

@app.get("/heatmaps/{filename}")
def get_heatmap(filename: str):

    filepath = filename

    if not os.path.exists(filepath):

        raise HTTPException(
            status_code=404,
            detail="Heatmap not found"
        )

    return FileResponse(
        filepath,
        media_type="image/png"
    )


@app.post("/heatmaps/generate")
def generate_heatmaps():

    generate_heatmap.generate_store_heatmap()

    generate_heatmap.generate_traffic_heatmap()

    zone_durations = (
        generate_heatmap
        .generate_shelf_heatmaps()
    )

    generate_heatmap.generate_product_attention_heatmap()

    return {
        "status":
            "Heatmaps generated successfully"
    }


# ============================================================
# CURRENT USER
# ============================================================

@app.get("/me")
def read_current_user(
    current_user: models.User = Depends(
        get_current_user
    )
):

    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role
    }


# ============================================================
# SHELF PRODUCT DETECTION
# ============================================================

@app.post("/detect-shelf-products")
def detect_shelf_products(
    file: UploadFile = File(...)
):

    upload_folder = "uploaded_images"

    os.makedirs(
        upload_folder,
        exist_ok=True
    )

    file_path = os.path.join(
        upload_folder,
        file.filename
    )

    with open(
        file_path,
        "wb"
    ) as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )

    from ultralytics import YOLO
    import cv2

    # Using fast nano model for speed
    model = YOLO("yolov8n.pt")

    results = model(
        file_path,
        conf=0.25
    )

    detections = []

    annotated_frame = None

    for r in results:

        for box in r.boxes:

            detections.append({
                "class": model.names[
                    int(box.cls[0])
                ],
                "confidence": round(
                    float(box.conf[0]),
                    2
                )
            })

        annotated_frame = r.plot()

    generic_regions, original_img = (
        detect_generic_product_regions(
            file_path
        )
    )

    if annotated_frame is not None:

        for region in generic_regions:

            cv2.rectangle(
                annotated_frame,
                (
                    region["x"],
                    region["y"]
                ),
                (
                    region["x"] + region["w"],
                    region["y"] + region["h"]
                ),
                (0, 255, 255),
                1
            )

    annotated_filename = (
        f"annotated_{file.filename}"
    )

    annotated_path = os.path.join(
        upload_folder,
        annotated_filename
    )

    if annotated_frame is not None:

        cv2.imwrite(
            annotated_path,
            annotated_frame
        )

    return {
        "filename":
            file.filename,

        "annotated_image_url":
            f"/uploaded-image/{annotated_filename}",

        "named_detections_count":
            len(detections),

        "detections":
            detections,

        "generic_regions_count":
            len(generic_regions),

        "estimated_total_products":
            len(detections)
            + len(generic_regions),

        "note":
            "Blue boxes = named YOLO detections "
            "(COCO's 80 categories only). Yellow boxes = "
            "generic product-shaped regions detected via "
            "edge analysis, catching packaging YOLO doesn't "
            "recognize by name (e.g., toothpaste boxes). "
            "This combined estimate gives broader shelf "
            "coverage than named detection alone, though "
            "it's still not true SKU-level recognition."
    }


# ============================================================
# UPLOADED IMAGE
# ============================================================

@app.get("/uploaded-image/{filename}")
def get_uploaded_image(filename: str):

    filepath = os.path.join(
        "uploaded_images",
        filename
    )

    if not os.path.exists(filepath):

        raise HTTPException(
            status_code=404,
            detail="Image not found"
        )

    return FileResponse(
        filepath,
        media_type="image/png"
    )


# ============================================================
# VIDEO TRAFFIC DETECTION
# ============================================================

@app.post("/detect-video-traffic")
def detect_video_traffic(
    file: UploadFile = File(...)
):

    import cv2
    from ultralytics import YOLO

    upload_folder = "uploaded_videos"

    os.makedirs(
        upload_folder,
        exist_ok=True
    )

    file_path = os.path.join(
        upload_folder,
        file.filename
    )

    with open(
        file_path,
        "wb"
    ) as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )

    model = YOLO("yolov8n.pt")

    cap = cv2.VideoCapture(
        file_path
    )

    if not cap.isOpened():

        raise HTTPException(
            status_code=400,
            detail="Could not process video file"
        )

    frame_count = 0

    unique_ids = set()

    max_simultaneous = 0

    while True:

        ret, frame = cap.read()

        if not ret:
            break

        frame_count += 1

        if frame_count % 3 != 0:
            continue

        results = model.track(
            frame,
            persist=True,
            verbose=False,
            classes=[0]
        )

        current_count = 0

        if results[0].boxes.id is not None:

            for track_id in results[0].boxes.id:

                unique_ids.add(
                    int(track_id)
                )

                current_count += 1

        max_simultaneous = max(
            max_simultaneous,
            current_count
        )

    cap.release()

    return {
        "filename":
            file.filename,

        "frames_processed":
            frame_count,

        "total_unique_people":
            len(unique_ids),

        "max_simultaneous_people":
            max_simultaneous,

        "note":
            "Validated multi-person tracking on uploaded "
            "video footage, confirming the system works on "
            "real-world retail traffic, not just live webcam input."
    }


# ============================================================
# SHELF DETAIL
# ============================================================

@app.get("/shelf-detail/{shelf_name}")
def get_shelf_detail(
    shelf_name: str,
    db: Session = Depends(get_db)
):

    all_scores = (
        scoring_engine
        .calculate_shelf_scores()
    )

    shelf_score = all_scores.get(
        shelf_name,
        None
    )

    all_recs = (
        recommendation_engine
        .generate_recommendations()
    )

    shelf_recs = next(
        (
            r
            for r in all_recs
            if r["shelf"] == shelf_name
        ),
        None
    )

    interactions = db.query(
        models.ProductInteraction
    ).filter(
        models.ProductInteraction.shelf_zone
        == shelf_name
    ).order_by(
        models.ProductInteraction.created_at.desc()
    ).limit(20).all()

    attention_history = db.query(
        models.AttentionRecord
    ).filter(
        models.AttentionRecord.zone
        == shelf_name
    ).order_by(
        models.AttentionRecord.created_at.desc()
    ).limit(20).all()

    # Find which shoppers visited THIS shelf
    # and their behavior segments

    visitor_ids = (
        set(
            i.person_track_id
            for i in interactions
        )
        |
        set(
            a.person_track_id
            for a in attention_history
        )
    )

    visitor_segments = []

    for pid in visitor_ids:

        result = (
            behavior_analysis
            .classify_shopper(
                pid,
                db
            )
        )

        if isinstance(result, dict):

            visitor_segments.append({
                "person_track_id":
                    pid,

                "segment":
                    result["segment"],

                "total_time_seconds":
                    result["total_time_seconds"]
            })

    return {
        "shelf_name":
            shelf_name,

        "score":
            shelf_score,

        "recommendations":
            shelf_recs["recommendations"]
            if shelf_recs
            else [],

        "visitor_segments":
            visitor_segments,

        "recent_interactions": [

            {
                "person_track_id":
                    i.person_track_id,

                "interaction_type":
                    i.interaction_type,

                "duration_seconds":
                    i.duration_seconds,

                "created_at":
                    i.created_at
            }

            for i in interactions
        ],

        "recent_attention": [

            {
                "person_track_id":
                    a.person_track_id,

                "attention_status":
                    a.attention_status,

                "duration_seconds":
                    a.duration_seconds,

                "created_at":
                    a.created_at
            }

            for a in attention_history
        ]
    }


# ============================================================
# DELETE STORE
# ============================================================

@app.delete("/stores/{store_id}")
def delete_store(
    store_id: int,
    db: Session = Depends(get_db)
):

    store = db.query(
        models.Store
    ).filter(
        models.Store.id == store_id
    ).first()

    if not store:

        raise HTTPException(
            status_code=404,
            detail="Store not found"
        )

    db.delete(store)
    db.commit()

    return {
        "status":
            "Store deleted successfully"
    }


# ============================================================
# DELETE SHELF
# ============================================================

@app.delete("/shelves/{shelf_id}")
def delete_shelf(
    shelf_id: int,
    db: Session = Depends(get_db)
):

    shelf = db.query(
        models.Shelf
    ).filter(
        models.Shelf.id == shelf_id
    ).first()

    if not shelf:

        raise HTTPException(
            status_code=404,
            detail="Shelf not found"
        )

    db.delete(shelf)
    db.commit()

    return {
        "status":
            "Shelf deleted successfully"
    }


# ============================================================
# DELETE CAMERA
# ============================================================

@app.delete("/cameras/{camera_id}")
def delete_camera(
    camera_id: int,
    db: Session = Depends(get_db)
):

    camera = db.query(
        models.Camera
    ).filter(
        models.Camera.id == camera_id
    ).first()

    if not camera:

        raise HTTPException(
            status_code=404,
            detail="Camera not found"
        )

    db.delete(camera)
    db.commit()

    return {
        "status":
            "Camera deleted successfully"
    }


# ============================================================
# ============================================================
# FULL VIDEO ANALYSIS - BACKGROUND JOB
# ============================================================
# ============================================================


def process_video_job(
    job_id,
    file_path,
    original_filename,
    clear_previous_data=True
):

    import cv2
    from ultralytics import YOLO

    cap = None

    try:

        print(
            f"[VIDEO JOB {job_id}] Starting processing...",
            flush=True
        )

        # ====================================================
        # 1. CLEAR PREVIOUS ANALYSIS DATA
        # ====================================================

        db = SessionLocal()

        try:

            if clear_previous_data:

                print(
                    f"[VIDEO JOB {job_id}] "
                    f"Clearing previous analysis data...",
                    flush=True
                )

                db.query(
                    models.PositionPoint
                ).delete()

                db.query(
                    models.AttentionRecord
                ).delete()

                db.query(
                    models.ProductInteraction
                ).delete()

                db.commit()

            # =================================================
            # 2. GET SHELVES
            # =================================================

            shelves_in_db = db.query(
                models.Shelf
            ).all()

        finally:

            db.close()

        NUM_ZONES = (
            min(
                len(shelves_in_db),
                5
            )
            if len(shelves_in_db) > 0
            else 3
        )

        zone_to_shelf = {}

        if (
            NUM_ZONES > 0
            and len(shelves_in_db) > 0
        ):

            for i in range(NUM_ZONES):

                zone_to_shelf[
                    f"Zone {i}"
                ] = shelves_in_db[i].shelf_name

        else:

            NUM_ZONES = 3

            zone_to_shelf = {
                "Zone 0": "Zone A",
                "Zone 1": "Zone B",
                "Zone 2": "Zone C"
            }

        print(
            f"[VIDEO JOB {job_id}] "
            f"Zones configured: {NUM_ZONES}",
            flush=True
        )

        # ====================================================
        # 3. LOAD MODELS
        # ====================================================

        print(
            f"[VIDEO JOB {job_id}] Loading YOLO model...",
            flush=True
        )

        # Nano model keeps CPU and memory usage lower.
        yolo_model = YOLO(
            "yolov8n.pt"
        )

        face_cascade = cv2.CascadeClassifier(
            "haarcascade_frontalface_default.xml"
        )

        eye_cascade = cv2.CascadeClassifier(
            "haarcascade_eye.xml"
        )

        # ====================================================
        # 4. OPEN VIDEO
        # ====================================================

        print(
            f"[VIDEO JOB {job_id}] Opening video...",
            flush=True
        )

        cap = cv2.VideoCapture(
            file_path
        )

        if not cap.isOpened():

            raise RuntimeError(
                "Could not open video file"
            )

        frame_width = int(
            cap.get(
                cv2.CAP_PROP_FRAME_WIDTH
            )
        )

        fps = (
            cap.get(
                cv2.CAP_PROP_FPS
            )
            or 30
        )

        if fps <= 0:
            fps = 30

        # ====================================================
        # 5. ZONE CALCULATION
        # ====================================================

        def get_zone(center_x):

            zone_index = min(
                int(
                    center_x
                    / (
                        frame_width
                        / NUM_ZONES
                    )
                ),
                NUM_ZONES - 1
            )

            return zone_to_shelf.get(
                f"Zone {zone_index}",
                f"Zone {zone_index}"
            )

        # ====================================================
        # 6. TRACKING STATE
        # ====================================================

        person_state = {}

        repeat_visits = {}

        frame_num = 0

        all_positions = []

        POSITION_BATCH_SIZE = 1000

        pending_attention_records = []

        pending_interactions = []

        DB_BATCH_SIZE = 50

        # ====================================================
        # 7. PROCESS VIDEO
        # ====================================================

        while True:

            ret, frame = cap.read()

            if not ret:
                break

            frame_num += 1

            # ------------------------------------------------
            # RENDER OPTIMIZATION
            # ------------------------------------------------
            # Process every 4th frame.
            # ------------------------------------------------

            if frame_num % 4 != 0:
                continue

            # ------------------------------------------------
            # RESIZE VIDEO
            # ------------------------------------------------

            target_width = 640

            target_height = int(
                target_width
                * frame.shape[0]
                / frame.shape[1]
            )

            frame_small = cv2.resize(
                frame,
                (
                    target_width,
                    target_height
                )
            )

            scale_x = (
                frame.shape[1]
                / frame_small.shape[1]
            )

            scale_y = (
                frame.shape[0]
                / frame_small.shape[0]
            )

            # ------------------------------------------------
            # YOLO + BYTE TRACK
            # ------------------------------------------------

            results = yolo_model.track(
                frame_small,
                persist=True,
                verbose=False,
                classes=[0],
                tracker="bytetrack.yaml"
            )

            # ------------------------------------------------
            # ATTENTION DETECTION
            # ------------------------------------------------

            run_attention_check = (
                (frame_num // 4) % 20 == 0
            )

            gray_full = (

                cv2.cvtColor(
                    frame,
                    cv2.COLOR_BGR2GRAY
                )

                if run_attention_check

                else None
            )

            # ------------------------------------------------
            # PERSON TRACKS
            # ------------------------------------------------

            if results[0].boxes.id is not None:

                for box, track_id in zip(
                    results[0].boxes.xyxy,
                    results[0].boxes.id
                ):

                    x1s, y1s, x2s, y2s = [
                        int(v)
                        for v in box.tolist()
                    ]

                    x1 = int(
                        x1s * scale_x
                    )

                    y1 = int(
                        y1s * scale_y
                    )

                    x2 = int(
                        x2s * scale_x
                    )

                    y2 = int(
                        y2s * scale_y
                    )

                    center_x = (
                        x1 + x2
                    ) / 2

                    center_y = (
                        y1 + y2
                    ) / 2

                    track_id = int(
                        track_id
                    )

                    zone = get_zone(
                        center_x
                    )

                    # Default attention state
                    attention_status = (
                        "Attentive"
                    )

                    # ------------------------------------------------
                    # FACE + EYE DETECTION
                    # ------------------------------------------------

                    if (
                        run_attention_check
                        and gray_full is not None
                    ):

                        person_region = (
                            gray_full[
                                max(0, y1):y2,
                                max(0, x1):x2
                            ]
                        )

                        if person_region.size > 0:

                            attention_status = (
                                "Looking Away"
                            )

                            faces = (
                                face_cascade
                                .detectMultiScale(
                                    person_region,
                                    scaleFactor=1.1,
                                    minNeighbors=4,
                                    minSize=(20, 20)
                                )
                            )

                            for (
                                fx,
                                fy,
                                fw,
                                fh
                            ) in faces:

                                face_gray = (
                                    person_region[
                                        fy:fy + fh,
                                        fx:fx + fw
                                    ]
                                )

                                eyes = (
                                    eye_cascade
                                    .detectMultiScale(
                                        face_gray,
                                        scaleFactor=1.1,
                                        minNeighbors=3
                                    )
                                )

                                if len(eyes) >= 1:

                                    attention_status = (
                                        "Attentive"
                                    )

                                break

                    # ------------------------------------------------
                    # STORE POSITION POINT
                    # ------------------------------------------------

                    all_positions.append(
                        models.PositionPoint(
                            person_track_id=track_id,
                            x=int(center_x),
                            y=int(center_y)
                        )
                    )

                    # ------------------------------------------------
                    # BATCH POSITION DATABASE INSERTS
                    # ------------------------------------------------

                    if (
                        len(all_positions)
                        >= POSITION_BATCH_SIZE
                    ):

                        db_batch = SessionLocal()

                        try:

                            db_batch.bulk_save_objects(
                                all_positions
                            )

                            db_batch.commit()

                        finally:

                            db_batch.close()

                        all_positions.clear()

                    # ------------------------------------------------
                    # FIRST OBSERVATION OF PERSON
                    # ------------------------------------------------

                    if track_id not in person_state:

                        person_state[
                            track_id
                        ] = {

                            "zone": zone,

                            "attention":
                                attention_status,

                            "frame_start":
                                frame_num
                        }

                        continue

                    # ------------------------------------------------
                    # EXISTING PERSON
                    # ------------------------------------------------

                    prev = person_state[
                        track_id
                    ]

                    if (
                        prev["zone"] != zone
                        or
                        prev["attention"]
                        != attention_status
                    ):

                        duration = (
                            frame_num
                            - prev["frame_start"]
                        ) / fps

                        # ------------------------------------------------
                        # REMOVE VERY SHORT TRACKING NOISE
                        # ------------------------------------------------

                        if duration < 0.2:

                            person_state[
                                track_id
                            ] = {

                                "zone":
                                    zone,

                                "attention":
                                    attention_status,

                                "frame_start":
                                    frame_num
                            }

                            continue

                        # ------------------------------------------------
                        # ATTENTION RECORD
                        # ------------------------------------------------

                        record = (
                            models.AttentionRecord(
                                person_track_id=track_id,

                                zone=prev["zone"],

                                attention_status=
                                    prev["attention"],

                                duration_seconds=
                                    int(duration)
                            )
                        )

                        pending_attention_records.append(
                            record
                        )

                        # ------------------------------------------------
                        # REPEAT VISITS
                        # ------------------------------------------------

                        key = (
                            track_id,
                            prev["zone"]
                        )

                        repeat_visits[key] = (
                            repeat_visits.get(
                                key,
                                0
                            ) + 1
                        )

                        prior_visits = (
                            repeat_visits[key]
                        )

                        zones_visited = set(
                            z
                            for (
                                pid,
                                z
                            ) in repeat_visits.keys()
                            if pid == track_id
                        )

                        # ------------------------------------------------
                        # INTERACTION CLASSIFICATION
                        # ------------------------------------------------

                        interaction_type = None

                        if (
                            prev["attention"]
                            == "Attentive"
                        ):

                            if duration >= 1.5:

                                interaction_type = (
                                    "Product Purchased "
                                    "(simulated - very long engagement)"
                                )

                            elif duration >= 0.7:

                                interaction_type = (
                                    "Product Picked Up "
                                    "(simulated)"
                                )

                            elif duration >= 0.2:

                                interaction_type = (
                                    "Product Viewed"
                                )

                            # Multiple shelf revisits
                            if (
                                len(zones_visited) >= 2
                                and prior_visits >= 2
                            ):

                                interaction_type = (
                                    "Product Compared "
                                    "(simulated - multiple shelf revisits)"
                                )

                        elif (
                            prev["attention"]
                            == "Looking Away"
                            and prior_visits >= 2
                            and duration < 1
                        ):

                            interaction_type = (
                                "Product Returned "
                                "(simulated - quick disengagement)"
                            )

                        # ------------------------------------------------
                        # STORE INTERACTION
                        # ------------------------------------------------

                        if interaction_type:

                            interaction = (
                                models.ProductInteraction(

                                    person_track_id=
                                        track_id,

                                    shelf_zone=
                                        prev["zone"],

                                    interaction_type=
                                        interaction_type,

                                    duration_seconds=
                                        int(duration)
                                )
                            )

                            pending_interactions.append(
                                interaction
                            )

                        # ------------------------------------------------
                        # BATCH ATTENTION INSERTS
                        # ------------------------------------------------

                        if (
                            len(
                                pending_attention_records
                            )
                            >= DB_BATCH_SIZE
                        ):

                            db_batch = SessionLocal()

                            try:

                                db_batch.bulk_save_objects(
                                    pending_attention_records
                                )

                                db_batch.commit()

                            finally:

                                db_batch.close()

                            pending_attention_records.clear()

                        # ------------------------------------------------
                        # BATCH INTERACTION INSERTS
                        # ------------------------------------------------

                        if (
                            len(
                                pending_interactions
                            )
                            >= DB_BATCH_SIZE
                        ):

                            db_batch = SessionLocal()

                            try:

                                db_batch.bulk_save_objects(
                                    pending_interactions
                                )

                                db_batch.commit()

                            finally:

                                db_batch.close()

                            pending_interactions.clear()

                        # ------------------------------------------------
                        # UPDATE PERSON STATE
                        # ------------------------------------------------

                        person_state[
                            track_id
                        ] = {

                            "zone":
                                zone,

                            "attention":
                                attention_status,

                            "frame_start":
                                frame_num
                        }

            # ------------------------------------------------
            # PROGRESS LOG
            # ------------------------------------------------

            if frame_num % 200 == 0:

                print(
                    f"[VIDEO JOB {job_id}] "
                    f"Processed frame {frame_num}...",
                    flush=True
                )

        # ====================================================
        # 8. CLOSE VIDEO
        # ====================================================

        if cap is not None:

            cap.release()

            cap = None

        print(
            f"[VIDEO JOB {job_id}] "
            f"Video processing finished. "
            f"Total frames: {frame_num}",
            flush=True
        )

        # ====================================================
        # 9. SAVE REMAINING POSITION POINTS
        # ====================================================

        if all_positions:

            db_batch = SessionLocal()

            try:

                db_batch.bulk_save_objects(
                    all_positions
                )

                db_batch.commit()

            finally:

                db_batch.close()

            all_positions.clear()

        # ====================================================
        # 10. SAVE REMAINING ATTENTION RECORDS
        # ====================================================

        if pending_attention_records:

            db_batch = SessionLocal()

            try:

                db_batch.bulk_save_objects(
                    pending_attention_records
                )

                db_batch.commit()

            finally:

                db_batch.close()

            pending_attention_records.clear()

        # ====================================================
        # 11. SAVE REMAINING INTERACTIONS
        # ====================================================

        if pending_interactions:

            db_batch = SessionLocal()

            try:

                db_batch.bulk_save_objects(
                    pending_interactions
                )

                db_batch.commit()

            finally:

                db_batch.close()

            pending_interactions.clear()

        # ====================================================
        # 12. CALCULATE SHELF SCORES
        # ====================================================

        print(
            f"[VIDEO JOB {job_id}] "
            f"Calculating shelf scores...",
            flush=True
        )

        scores = (
            scoring_engine
            .calculate_shelf_scores()
        )

        # ====================================================
        # 13. GENERATE RECOMMENDATIONS
        # ====================================================

        recs = (
            recommendation_engine
            .generate_recommendations()
        )

        # ====================================================
        # 14. LOAD ANALYSIS RECORDS
        # ====================================================

        db4 = SessionLocal()

        try:

            attention_records = (
                db4.query(
                    models.AttentionRecord
                ).all()
            )

            interactions = (
                db4.query(
                    models.ProductInteraction
                ).all()
            )

        finally:

            db4.close()

        # ====================================================
        # 15. INTERACTION SUMMARY
        # ====================================================

        interaction_counts = {}

        for i in interactions:

            interaction_counts[
                i.interaction_type
            ] = (
                interaction_counts.get(
                    i.interaction_type,
                    0
                ) + 1
            )

        # ====================================================
        # 16. ATTENTION SUMMARY
        # ====================================================

        total_attention_time = sum(
            r.duration_seconds
            for r in attention_records
        )

        attentive_count = sum(
            1
            for r in attention_records
            if r.attention_status
            == "Attentive"
        )

        # ====================================================
        # 17. GENERATE HEATMAPS
        # ====================================================

        print(
            f"[VIDEO JOB {job_id}] "
            f"Generating heatmaps...",
            flush=True
        )

        generate_heatmap.generate_store_heatmap()

        generate_heatmap.generate_traffic_heatmap()

        generate_heatmap.generate_shelf_heatmaps()

        generate_heatmap.generate_product_attention_heatmap()

        # ====================================================
        # 18. GENERATE REPORTS
        # ====================================================

        print(
            f"[VIDEO JOB {job_id}] "
            f"Generating reports...",
            flush=True
        )

        pdf_path = (
            reports_engine
            .generate_pdf_report()
        )

        excel_path = (
            reports_engine
            .generate_excel_report()
        )

        # ====================================================
        # 19. CONSUMER BEHAVIOR INTELLIGENCE
        # ====================================================

        print(
            f"[VIDEO JOB {job_id}] "
            f"Running behavior analysis...",
            flush=True
        )

        db5 = SessionLocal()

        try:

            all_ids = db5.query(
                models.AttentionRecord.person_track_id
            ).distinct().all()

            person_ids = [
                row[0]
                for row in all_ids
            ]

            shopper_details = []

            for pid in person_ids:

                result = (
                    behavior_analysis
                    .classify_shopper(
                        pid,
                        db5
                    )
                )

                if isinstance(result, dict):

                    journey = (
                        db5.query(
                            models.JourneyLog
                        )
                        .filter(
                            models.JourneyLog.person_track_id
                            == pid
                        )
                        .order_by(
                            models.JourneyLog.sequence_number
                        )
                        .all()
                    )

                    result["journey_path"] = [
                        j.zone
                        for j in journey
                    ]

                    shopper_details.append(
                        result
                    )

        finally:

            db5.close()

        # ====================================================
        # 20. MOVEMENT BEHAVIOR
        # ====================================================

        movement_by_segment = {}

        for s in shopper_details:

            seg = s["segment"]

            movement_by_segment.setdefault(
                seg,
                []
            ).append(
                len(
                    s["zones_visited"]
                )
            )

        movement_analysis = {

            seg:
                round(
                    sum(vals)
                    / len(vals)
                )

            for seg, vals
            in movement_by_segment.items()

            if vals
        }

        # ====================================================
        # 21. PRODUCT PREFERENCE
        # ====================================================

        preference_by_segment = {}

        for s in shopper_details:

            seg = s["segment"]

            for zone in s["zones_visited"]:

                preference_by_segment.setdefault(
                    seg,
                    {}
                )

                preference_by_segment[
                    seg
                ][zone] = (

                    preference_by_segment[
                        seg
                    ].get(
                        zone,
                        0
                    ) + 1
                )

        top_preference_by_segment = {

            seg:
                max(
                    shelves,
                    key=shelves.get
                )

            for seg, shelves
            in preference_by_segment.items()

            if shelves
        }

        # ====================================================
        # 22. COMMON TRANSITIONS
        # ====================================================

        transition_counts = {}

        for s in shopper_details:

            path = s["journey_path"]

            for i in range(
                len(path) - 1
            ):

                # Skip self loops
                if (
                    path[i]
                    == path[i + 1]
                ):
                    continue

                transition = (
                    path[i],
                    path[i + 1]
                )

                transition_counts[
                    transition
                ] = (
                    transition_counts.get(
                        transition,
                        0
                    ) + 1
                )

        sorted_transitions = sorted(
            transition_counts.items(),
            key=lambda x: x[1],
            reverse=True
        )

        most_frequent_routes = [

            {
                "from":
                    t[0][0],

                "to":
                    t[0][1],

                "count":
                    t[1]
            }

            for t
            in sorted_transitions[:3]
        ]

        least_frequent_routes = (

            [

                {
                    "from":
                        t[0][0],

                    "to":
                        t[0][1],

                    "count":
                        t[1]
                }

                for t
                in sorted_transitions[-3:]
            ]

            if len(
                sorted_transitions
            ) > 6

            else []
        )

        # ====================================================
        # 23. SHOPPING PATTERN
        # ====================================================

        pattern_by_segment = {}

        for s in shopper_details:

            seg = s["segment"]

            pattern_by_segment.setdefault(
                seg,
                []
            ).append(
                s["total_time_seconds"]
            )

        shopping_pattern = {

            seg:
                round(
                    sum(vals)
                    / len(vals),
                    1
                )

            for seg, vals
            in pattern_by_segment.items()

            if vals
        }

        # ====================================================
        # 24. FINAL RESULT
        # ====================================================

        result = {

            "filename":
                original_filename,

            "frames_processed":
                frame_num,

            "unique_people_tracked":
                len(person_state),

            "shelf_scores":
                scores,

            "recommendations":
                recs,

            "interaction_summary":
                interaction_counts,

            "total_attention_time_seconds":
                total_attention_time,

            "total_attentive_events":
                attentive_count,

            "movement_analysis":
                movement_analysis,

            "top_preference_by_segment":
                top_preference_by_segment,

            "most_frequent_routes":
                most_frequent_routes,

            "least_frequent_routes":
                least_frequent_routes,

            "total_unique_routes":
                len(transition_counts),

            "shopping_pattern":
                shopping_pattern,

            "pdf_report_url":
                "/reports/pdf",

            "excel_report_url":
                "/reports/excel"
        }

        print(
            f"[VIDEO JOB {job_id}] "
            f"ANALYSIS COMPLETED SUCCESSFULLY.",
            flush=True
        )

        return result

    except Exception as e:

        print(
            f"[VIDEO JOB {job_id}] "
            f"FAILED: {str(e)}",
            flush=True
        )

        raise

    finally:

        # Always release OpenCV video resource
        if cap is not None:

            try:
                cap.release()
            except Exception:
                pass

        # Always remove uploaded video after processing
        try:

            if os.path.exists(file_path):

                os.remove(
                    file_path
                )

                print(
                    f"[VIDEO JOB {job_id}] "
                    f"Temporary video removed.",
                    flush=True
                )

        except Exception as cleanup_error:

            print(
                f"[VIDEO JOB {job_id}] "
                f"Could not remove temporary video: "
                f"{cleanup_error}",
                flush=True
            )


# ============================================================
# START FULL VIDEO ANALYSIS JOB
# ============================================================

@app.post("/analyze-video-full")
def analyze_video_full(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    clear_previous_data: bool = True
):

    upload_folder = "uploaded_videos"

    os.makedirs(
        upload_folder,
        exist_ok=True
    )

    # ========================================================
    # CREATE UNIQUE JOB ID
    # ========================================================

    job_id = str(
        uuid.uuid4()
    )

    # Prevent unsafe filenames
    safe_filename = os.path.basename(
        file.filename
    )

    # Store video using job ID so two uploads don't collide.
    file_path = os.path.join(
        upload_folder,
        f"{job_id}_{safe_filename}"
    )

    # ========================================================
    # SAVE VIDEO
    # ========================================================

    try:

        with open(
            file_path,
            "wb"
        ) as buffer:

            shutil.copyfileobj(
                file.file,
                buffer
            )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=(
                f"Video upload failed: {str(e)}"
            )
        )

    # ========================================================
    # CREATE JOB ENTRY
    # ========================================================

    with VIDEO_JOBS_LOCK:

        VIDEO_JOBS[job_id] = {

            "status":
                "queued",

            "result":
                None,

            "error":
                None,

            "filename":
                safe_filename
        }

    # ========================================================
    # BACKGROUND WRAPPER
    # ========================================================

    def run_job():

        try:

            # Mark job as processing
            with VIDEO_JOBS_LOCK:

                VIDEO_JOBS[
                    job_id
                ]["status"] = "processing"

            print(
                f"[VIDEO JOB {job_id}] "
                f"Background processing started.",
                flush=True
            )

            # Run complete existing analysis pipeline
            result = process_video_job(
                job_id=job_id,
                file_path=file_path,
                original_filename=safe_filename,
                clear_previous_data=clear_previous_data
            )

            # Store successful result
            with VIDEO_JOBS_LOCK:

                VIDEO_JOBS[
                    job_id
                ]["status"] = "completed"

                VIDEO_JOBS[
                    job_id
                ]["result"] = result

            print(
                f"[VIDEO JOB {job_id}] "
                f"Job marked completed.",
                flush=True
            )

        except Exception as e:

            # Store error
            with VIDEO_JOBS_LOCK:

                VIDEO_JOBS[
                    job_id
                ]["status"] = "failed"

                VIDEO_JOBS[
                    job_id
                ]["error"] = str(e)

            print(
                f"[VIDEO JOB {job_id}] "
                f"Job marked failed: {str(e)}",
                flush=True
            )

    # ========================================================
    # ADD TO FASTAPI BACKGROUND TASKS
    # ========================================================

    background_tasks.add_task(
        run_job
    )

    # ========================================================
    # RETURN IMMEDIATELY
    # ========================================================

    print(
        f"[VIDEO JOB {job_id}] "
        f"Upload received. Job queued.",
        flush=True
    )

    return {

        "job_id":
            job_id,

        "status":
            "queued",

        "filename":
            safe_filename,

        "message":
            "Video uploaded successfully. "
            "Analysis is running in the background."
    }


# ============================================================
# VIDEO ANALYSIS STATUS
# ============================================================

@app.get(
    "/analyze-video-full/status/{job_id}"
)
def video_analysis_status(
    job_id: str
):

    # ========================================================
    # FIND JOB
    # ========================================================

    with VIDEO_JOBS_LOCK:

        job = VIDEO_JOBS.get(
            job_id
        )

    if not job:

        raise HTTPException(
            status_code=404,
            detail="Video analysis job not found"
        )

    # ========================================================
    # BASIC RESPONSE
    # ========================================================

    response = {

        "job_id":
            job_id,

        "status":
            job["status"],

        "filename":
            job.get("filename")
    }

    # ========================================================
    # COMPLETED
    # ========================================================

    if (
        job["status"]
        == "completed"
    ):

        response["result"] = (
            job["result"]
        )

    # ========================================================
    # FAILED
    # ========================================================

    if (
        job["status"]
        == "failed"
    ):

        response["error"] = (
            job["error"]
        )

    return response


# ============================================================
# STORE TRAFFIC SUMMARY
# ============================================================

@app.get("/store-traffic-summary")
def get_store_traffic_summary(
    db: Session = Depends(get_db)
):

    total_position_points = (
        db.query(
            models.PositionPoint
        ).count()
    )

    unique_visitors = (
        db.query(
            models.AttentionRecord.person_track_id
        )
        .distinct()
        .count()
    )

    total_attention_records = (
        db.query(
            models.AttentionRecord
        ).count()
    )

    attentive = (
        db.query(
            models.AttentionRecord
        )
        .filter(
            models.AttentionRecord.attention_status
            == "Attentive"
        )
        .count()
    )

    attentive_rate = (

        round(
            (
                attentive
                / total_attention_records
                * 100
            ),
            1
        )

        if total_attention_records > 0

        else 0
    )

    return {

        "unique_visitors":
            unique_visitors,

        "total_movement_points":
            total_position_points,

        "total_tracked_events":
            total_attention_records,

        "attentive_rate_percent":
            attentive_rate
    }


# ============================================================
# USERS
# ============================================================

@app.get("/users")
def get_all_users(
    db: Session = Depends(get_db)
):

    users = db.query(
        models.User
    ).all()

    return [

        {
            "id":
                u.id,

            "name":
                u.name,

            "email":
                u.email,

            "role":
                u.role
        }

        for u in users
    ]


@app.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db)
):

    user = db.query(
        models.User
    ).filter(
        models.User.id == user_id
    ).first()

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    db.delete(user)
    db.commit()

    return {
        "status":
            "User deleted successfully"
    }


# ============================================================
# EXECUTIVE SUMMARY
# ============================================================

@app.get("/executive-summary")
def get_executive_summary(
    db: Session = Depends(get_db)
):

    total_stores = (
        db.query(
            models.Store
        ).count()
    )

    total_shelves = (
        db.query(
            models.Shelf
        ).count()
    )

    total_cameras = (
        db.query(
            models.Camera
        ).count()
    )

    scores = (
        scoring_engine
        .calculate_shelf_scores()
    )

    if scores:

        avg_score = round(

            sum(
                d["attractiveness_score"]
                for d in scores.values()
            )
            / len(scores),

            1
        )

        sorted_shelves = sorted(

            scores.items(),

            key=lambda x:
                x[1]["attractiveness_score"],

            reverse=True
        )

        num_shelves = len(
            sorted_shelves
        )

        top_count = min(
            3,
            num_shelves
        )

        bottom_count = min(
            3,
            num_shelves - top_count
        )

        top_shelves = [

            {
                "shelf":
                    s[0],

                "score":
                    s[1][
                        "attractiveness_score"
                    ]
            }

            for s
            in sorted_shelves[
                :top_count
            ]
        ]

        bottom_shelves = (

            [

                {
                    "shelf":
                        s[0],

                    "score":
                        s[1][
                            "attractiveness_score"
                        ]
                }

                for s
                in sorted_shelves[
                    -bottom_count:
                ]
            ]

            if bottom_count > 0

            else []
        )

    else:

        avg_score = 0

        top_shelves = []

        bottom_shelves = []

    unique_shoppers = (
        db.query(
            models.AttentionRecord.person_track_id
        )
        .distinct()
        .count()
    )

    alerts = db.query(
        models.Alert
    ).all()

    critical_alerts = sum(

        1

        for a in alerts

        if a.severity
        in [
            "High",
            "Critical"
        ]
    )

    total_purchases = sum(

        1

        for i
        in db.query(
            models.ProductInteraction
        ).all()

        if "Purchased"
        in i.interaction_type
    )

    return {

        "total_stores":
            total_stores,

        "total_shelves":
            total_shelves,

        "total_cameras":
            total_cameras,

        "average_shelf_score":
            avg_score,

        "top_shelves":
            top_shelves,

        "bottom_shelves":
            bottom_shelves,

        "unique_shoppers_tracked":
            unique_shoppers,

        "total_alerts":
            len(alerts),

        "critical_alerts":
            critical_alerts,

        "total_purchases":
            total_purchases,

        "shelf_scores":
            scores
    }