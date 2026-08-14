from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional

from ..database import get_db
from ..models import Store, Zone, Shelf, Camera
from ..auth import get_current_user

router = APIRouter()

# ---------- STORE CRUD ----------

class StoreCreate(BaseModel):
    name: str
    location: Optional[str] = None

class StoreUpdate(BaseModel):
    name: Optional[str] = None
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

@router.put("/stores/{store_id}")
def update_store(store_id: int, payload: StoreUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    if payload.name is not None:
        store.name = payload.name
    if payload.location is not None:
        store.location = payload.location
    db.commit()
    db.refresh(store)
    return store

@router.delete("/stores/{store_id}")
def delete_store(store_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    db.delete(store)
    db.commit()
    return {"message": "Store deleted", "id": store_id}


# ---------- ZONE CRUD ----------

class ZoneCreate(BaseModel):
    store_id: int
    zone_name: str

class ZoneUpdate(BaseModel):
    zone_name: Optional[str] = None

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

@router.put("/zones/{zone_id}")
def update_zone(zone_id: int, payload: ZoneUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    zone = db.query(Zone).filter(Zone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    if payload.zone_name is not None:
        zone.zone_name = payload.zone_name
    db.commit()
    db.refresh(zone)
    return zone

@router.delete("/zones/{zone_id}")
def delete_zone(zone_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    zone = db.query(Zone).filter(Zone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    db.delete(zone)
    db.commit()
    return {"message": "Zone deleted", "id": zone_id}


# ---------- SHELF CRUD ----------

class ShelfCreate(BaseModel):
    store_id: int
    zone_id: int
    shelf_code: str
    position_x: Optional[float] = None
    position_y: Optional[float] = None

class ShelfUpdate(BaseModel):
    shelf_code: Optional[str] = None
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

@router.put("/shelves/{shelf_id}")
def update_shelf(shelf_id: int, payload: ShelfUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    shelf = db.query(Shelf).filter(Shelf.id == shelf_id).first()
    if not shelf:
        raise HTTPException(status_code=404, detail="Shelf not found")
    for key, val in payload.dict(exclude_unset=True).items():
        setattr(shelf, key, val)
    db.commit()
    db.refresh(shelf)
    return shelf

@router.delete("/shelves/{shelf_id}")
def delete_shelf(shelf_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    shelf = db.query(Shelf).filter(Shelf.id == shelf_id).first()
    if not shelf:
        raise HTTPException(status_code=404, detail="Shelf not found")
    db.delete(shelf)
    db.commit()
    return {"message": "Shelf deleted", "id": shelf_id}


# ---------- CAMERA CRUD ----------

class CameraCreate(BaseModel):
    store_id: int
    zone_id: int
    camera_code: str
    ip_address: Optional[str] = None
    status: Optional[str] = "active"

class CameraUpdate(BaseModel):
    camera_code: Optional[str] = None
    ip_address: Optional[str] = None
    status: Optional[str] = None
    zone_id: Optional[int] = None

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

@router.put("/cameras/{camera_id}")
def update_camera(camera_id: int, payload: CameraUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    camera = db.query(Camera).filter(Camera.id == camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    for key, val in payload.dict(exclude_unset=True).items():
        setattr(camera, key, val)
    db.commit()
    db.refresh(camera)
    return camera

@router.delete("/cameras/{camera_id}")
def delete_camera(camera_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    camera = db.query(Camera).filter(Camera.id == camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    db.delete(camera)
    db.commit()
    return {"message": "Camera deleted", "id": camera_id}