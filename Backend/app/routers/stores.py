from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional
import time

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
    store_id: Optional[int] = None
    zone_id: Optional[int] = None
    camera_code: Optional[str] = None
    name: Optional[str] = None
    store: Optional[str] = None
    zone: Optional[str] = None
    resolution: Optional[str] = "4K (3840x2160)"
    fps: Optional[int] = 30
    ip: Optional[str] = None
    ip_address: Optional[str] = None
    status: Optional[str] = "Online"

class CameraUpdate(BaseModel):
    camera_code: Optional[str] = None
    name: Optional[str] = None
    store: Optional[str] = None
    zone: Optional[str] = None
    resolution: Optional[str] = None
    fps: Optional[int] = None
    ip: Optional[str] = None
    ip_address: Optional[str] = None
    status: Optional[str] = None
    store_id: Optional[int] = None
    zone_id: Optional[int] = None

@router.post("/cameras")
def create_camera(payload: CameraCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    store_id = payload.store_id
    if not store_id and payload.store:
        st = db.query(Store).filter(Store.name == payload.store).first()
        if st:
            store_id = st.id
        else:
            first_store = db.query(Store).first()
            if first_store:
                store_id = first_store.id

    zone_id = payload.zone_id
    if not zone_id and payload.zone and store_id:
        zn = db.query(Zone).filter(Zone.zone_name == payload.zone, Zone.store_id == store_id).first()
        if zn:
            zone_id = zn.id

    cam_code = payload.camera_code
    if not cam_code:
        cam_count = db.query(Camera).count()
        cam_code = f"CAM-{str(cam_count + 1).zfill(2)}"

    existing = db.query(Camera).filter(Camera.camera_code == cam_code).first()
    if existing:
        cam_code = f"CAM-{str(int(time.time()))[-4:]}"

    cam_name = payload.name or cam_code
    cam_ip = payload.ip or payload.ip_address or "192.168.1.101"
    cam_zone = payload.zone or "Entrance"
    cam_status = payload.status or "Online"
    cam_res = payload.resolution or "4K (3840x2160)"
    cam_fps = payload.fps if payload.fps is not None else 30

    camera = Camera(
        store_id=store_id,
        zone_id=zone_id,
        camera_code=cam_code,
        name=cam_name,
        zone_name=cam_zone,
        resolution=cam_res,
        fps=cam_fps,
        ip_address=cam_ip,
        status=cam_status
    )
    db.add(camera)
    db.commit()
    db.refresh(camera)
    return {
        "id": camera.camera_code,
        "db_id": camera.id,
        "name": camera.name or camera.camera_code,
        "store": camera.store_rel.name if camera.store_rel else (payload.store or "Downtown Flagship"),
        "zone": camera.zone_name or "Entrance",
        "resolution": camera.resolution or "4K (3840x2160)",
        "fps": camera.fps or 30,
        "ip": camera.ip_address or "192.168.1.101",
        "status": camera.status or "Online"
    }

@router.get("/cameras")
def list_cameras(store_id: Optional[int] = None, db: Session = Depends(get_db), user=Depends(get_current_user)):
    query = db.query(Camera)
    if store_id:
        query = query.filter(Camera.store_id == store_id)
    cams = query.all()
    results = []
    for c in cams:
        results.append({
            "id": c.camera_code or f"CAM-{c.id}",
            "db_id": c.id,
            "name": c.name or c.camera_code or f"Camera {c.id}",
            "store": c.store_rel.name if c.store_rel else "Downtown Flagship",
            "zone": c.zone_name or "Entrance",
            "resolution": c.resolution or "4K (3840x2160)",
            "fps": c.fps or 30,
            "ip": c.ip_address or "192.168.1.100",
            "status": c.status or "Online"
        })
    return results

@router.put("/cameras/{camera_id}")
def update_camera(camera_id: str, payload: CameraUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    camera = None
    if camera_id.isdigit():
        camera = db.query(Camera).filter(Camera.id == int(camera_id)).first()
    if not camera:
        camera = db.query(Camera).filter(Camera.camera_code == camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")

    if payload.name is not None:
        camera.name = payload.name
    if payload.status is not None:
        camera.status = payload.status
    if payload.zone is not None:
        camera.zone_name = payload.zone
    if payload.resolution is not None:
        camera.resolution = payload.resolution
    if payload.fps is not None:
        camera.fps = payload.fps
    if payload.ip is not None:
        camera.ip_address = payload.ip
    elif payload.ip_address is not None:
        camera.ip_address = payload.ip_address
    if payload.store is not None:
        st = db.query(Store).filter(Store.name == payload.store).first()
        if st:
            camera.store_id = st.id

    db.commit()
    db.refresh(camera)
    return {
        "id": camera.camera_code,
        "db_id": camera.id,
        "name": camera.name or camera.camera_code,
        "store": camera.store_rel.name if camera.store_rel else (payload.store or "Downtown Flagship"),
        "zone": camera.zone_name or "Entrance",
        "resolution": camera.resolution or "4K (3840x2160)",
        "fps": camera.fps or 30,
        "ip": camera.ip_address or "192.168.1.100",
        "status": camera.status or "Online"
    }

@router.delete("/cameras/{camera_id}")
def delete_camera(camera_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    camera = None
    if camera_id.isdigit():
        camera = db.query(Camera).filter(Camera.id == int(camera_id)).first()
    if not camera:
        camera = db.query(Camera).filter(Camera.camera_code == camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    db.delete(camera)
    db.commit()
    return {"message": "Camera deleted", "id": camera_id}