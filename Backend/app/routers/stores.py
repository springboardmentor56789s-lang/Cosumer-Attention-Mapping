from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional

from ..database import get_db
from ..models import Store, Zone, Shelf, Camera
from ..auth import get_current_user

router = APIRouter()

# ---------- STORE ----------

class StoreCreate(BaseModel):
    name: str
    location: Optional[str] = None

@router.post("/stores")
def create_store(payload: StoreCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    store = Store(name=payload.name, location=payload.location)
    db.add(store)
    db.commit()
    db.refresh(store)
    return store

@router.get("/stores")
def list_stores(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(Store).all()

@router.get("/stores/{store_id}")
def get_store(store_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    return store

@router.delete("/stores/{store_id}")
def delete_store(store_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    db.delete(store)
    db.commit()
    return {"message": "Store deleted"}


# ---------- ZONE ----------

class ZoneCreate(BaseModel):
    store_id: int
    zone_name: str

@router.post("/zones")
def create_zone(payload: ZoneCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    store = db.query(Store).filter(Store.id == payload.store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")

    zone = Zone(store_id=payload.store_id, zone_name=payload.zone_name)
    db.add(zone)
    db.commit()
    db.refresh(zone)
    return zone

@router.get("/zones")
def list_zones(store_id: Optional[int] = None, db: Session = Depends(get_db), user=Depends(get_current_user)):
    query = db.query(Zone)
    if store_id:
        query = query.filter(Zone.store_id == store_id)
    return query.all()


# ---------- SHELF ----------

class ShelfCreate(BaseModel):
    store_id: int
    zone_id: int
    shelf_code: str
    position_x: Optional[float] = None
    position_y: Optional[float] = None

@router.post("/shelves")
def create_shelf(payload: ShelfCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    store = db.query(Store).filter(Store.id == payload.store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")

    zone = db.query(Zone).filter(Zone.id == payload.zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")

    shelf = Shelf(**payload.dict())
    db.add(shelf)
    db.commit()
    db.refresh(shelf)
    return shelf

@router.get("/shelves")
def list_shelves(store_id: Optional[int] = None, db: Session = Depends(get_db), user=Depends(get_current_user)):
    query = db.query(Shelf)
    if store_id:
        query = query.filter(Shelf.store_id == store_id)
    return query.all()


# ---------- CAMERA ----------

class CameraCreate(BaseModel):
    store_id: int
    zone_id: int
    camera_code: str
    ip_address: Optional[str] = None

@router.post("/cameras")
def create_camera(payload: CameraCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    store = db.query(Store).filter(Store.id == payload.store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")

    zone = db.query(Zone).filter(Zone.id == payload.zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")

    existing = db.query(Camera).filter(Camera.camera_code == payload.camera_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Camera code already exists")

    camera = Camera(**payload.dict())
    db.add(camera)
    db.commit()
    db.refresh(camera)
    return camera

@router.get("/cameras")
def list_cameras(store_id: Optional[int] = None, db: Session = Depends(get_db), user=Depends(get_current_user)):
    query = db.query(Camera)
    if store_id:
        query = query.filter(Camera.store_id == store_id)
    return query.all()