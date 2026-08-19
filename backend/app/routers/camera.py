from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from database.database import get_db
from app.model import Camera, Store
from app.schemas.camera_schema import CameraCreate, CameraUpdate
from app.schemas.production import CameraCreate as ProductionCameraCreate
from app.services.video_pipeline_service import VideoPipelineService

router = APIRouter(
    prefix="/camera",
    tags=["Camera"]
)
pipeline_service = VideoPipelineService()

# ==========================================================
# Add Camera
# POST /camera/add
# ==========================================================

@router.post("/add", status_code=status.HTTP_201_CREATED)
def add_camera(camera: ProductionCameraCreate, db: Session = Depends(get_db)):

    # Check Store Exists
    store = db.query(Store).filter(Store.id == camera.store_id).first()

    if not store:
        raise HTTPException(
            status_code=404,
            detail="Store not found"
        )

    new_camera = Camera(
        camera_name=camera.camera_name,
        store_id=camera.store_id,
        rtsp_url=camera.rtsp_url,
        location=camera.location,
        status=camera.status,
        camera_type=camera.camera_type,
        fps=camera.fps,
        processing_status=camera.processing_status,
        current_detection_status="Idle"
    )

    db.add(new_camera)
    db.commit()
    db.refresh(new_camera)

    return {
        "message": "Camera Added Successfully",
        "camera": new_camera
    }


# ==========================================================
# Get All Cameras
# GET /camera/
# ==========================================================

@router.get("/")
def get_all_cameras(db: Session = Depends(get_db)):

    cameras = db.query(Camera).all()

    return {
        "total_cameras": len(cameras),
        "data": cameras
    }


# ==========================================================
# Get Camera By ID
# GET /camera/{camera_id}
# ==========================================================

@router.get("/{camera_id}")
def get_camera(camera_id: int, db: Session = Depends(get_db)):

    camera = db.query(Camera).filter(
        Camera.id == camera_id
    ).first()

    if not camera:
        raise HTTPException(
            status_code=404,
            detail="Camera not found"
        )

    return camera


# ==========================================================
# Update Camera
# PUT /camera/{camera_id}
# ==========================================================

@router.put("/{camera_id}")
def update_camera(
    camera_id: int,
    camera_data: CameraUpdate,
    db: Session = Depends(get_db)
):

    camera = db.query(Camera).filter(
        Camera.id == camera_id
    ).first()

    if not camera:
        raise HTTPException(
            status_code=404,
            detail="Camera not found"
        )

    update_data = camera_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(camera, key, value)

    db.commit()
    db.refresh(camera)

    return {
        "message": "Camera Updated Successfully",
        "camera": camera
    }


# ==========================================================
# Delete Camera
# DELETE /camera/{camera_id}
# ==========================================================

@router.get("/{camera_id}/status")
def camera_status(camera_id: int, db: Session = Depends(get_db)):
    camera = db.query(Camera).filter(Camera.id == camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    return pipeline_service.get_camera_status(camera)


@router.get("/{camera_id}/stream")
def camera_stream(camera_id: int, db: Session = Depends(get_db)):
    camera = db.query(Camera).filter(Camera.id == camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")

    return StreamingResponse(
        pipeline_service.iter_stream_frames(camera, db=db),
        media_type="multipart/x-mixed-replace; boundary=frame",
    )


@router.delete("/{camera_id}")
def delete_camera(camera_id: int, db: Session = Depends(get_db)):

    camera = db.query(Camera).filter(
        Camera.id == camera_id
    ).first()

    if not camera:
        raise HTTPException(
            status_code=404,
            detail="Camera not found"
        )

    db.delete(camera)
    db.commit()

    return {
        "message": "Camera Deleted Successfully"
    }