from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models.domain import Shelf
from app.schemas.schemas import ShelfOut, ShelfCreate

router = APIRouter()

@router.get("", response_model=List[ShelfOut])
def get_shelves(store_id: Optional[int] = None, category: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Shelf)
    if store_id:
        query = query.filter(Shelf.store_id == store_id)
    if category:
        query = query.filter(Shelf.category == category)
    return query.all()

@router.post("", response_model=ShelfOut)
def create_shelf(shelf_in: ShelfCreate, db: Session = Depends(get_db)):
    shelf = Shelf(**shelf_in.model_dump())
    db.add(shelf)
    db.commit()
    db.refresh(shelf)
    return shelf
