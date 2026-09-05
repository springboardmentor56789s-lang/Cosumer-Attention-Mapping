from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models.domain import Store
from app.schemas.schemas import StoreOut, StoreCreate

router = APIRouter()

@router.get("", response_model=List[StoreOut])
def get_stores(city: Optional[str] = None, status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Store)
    if city:
        query = query.filter(Store.city == city)
    if status:
        query = query.filter(Store.status == status)
    return query.all()

@router.get("/{store_id}", response_model=StoreOut)
def get_store(store_id: int, db: Session = Depends(get_db)):
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    return store

@router.post("", response_model=StoreOut)
def create_store(store_in: StoreCreate, db: Session = Depends(get_db)):
    store = Store(**store_in.model_dump())
    db.add(store)
    db.commit()
    db.refresh(store)
    return store

@router.put("/{store_id}", response_model=StoreOut)
def update_store(store_id: int, store_in: StoreCreate, db: Session = Depends(get_db)):
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    for key, val in store_in.model_dump().items():
        setattr(store, key, val)
    db.commit()
    db.refresh(store)
    return store

@router.delete("/{store_id}")
def delete_store(store_id: int, db: Session = Depends(get_db)):
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    db.delete(store)
    db.commit()
    return {"message": f"Store {store_id} deleted successfully"}
