from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models.domain import Camera
from app.schemas.schemas import CameraOut, CameraCreate

router = APIRouter()

@router.get("", response_model=List[CameraOut])
def get_cameras(store_id: Optional[int] = None, status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Camera)
    if store_id:
        query = query.filter(Camera.store_id == store_id)
    if status:
        query = query.filter(Camera.status == status)
    return query.all()

@router.post("", response_model=CameraOut)
def create_camera(camera_in: CameraCreate, db: Session = Depends(get_db)):
    camera = Camera(**camera_in.model_dump())
    db.add(camera)
    db.commit()
    db.refresh(camera)
    return camera
