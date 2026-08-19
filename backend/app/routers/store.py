from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app import model
from app.dependencies import require_admin
from database.database import get_db


router = APIRouter(prefix="/api/stores", tags=["Store Management"])


class StorePayload(BaseModel):
    store_name: str = Field(min_length=2, max_length=100)
    location: str = Field(min_length=2, max_length=150)
    manager_name: Optional[str] = Field(default=None, max_length=100)


def _store_summary(store: model.Store, db: Session) -> dict:
    shelf_count = db.query(model.Shelf).filter(model.Shelf.store_id == store.id).count()
    product_count = (
        db.query(model.Product)
        .join(model.Shelf, model.Product.shelf_id == model.Shelf.id)
        .filter(model.Shelf.store_id == store.id)
        .count()
    )
    analytics_count = db.query(model.Analytics).filter(model.Analytics.store_id == store.id).count()
    return {
        "id": store.id,
        "store_name": store.store_name,
        "location": store.location or "—",
        "manager_name": store.manager_name or "Unassigned",
        "shelves": shelf_count,
        "products": product_count,
        "analytics_rows": analytics_count,
        "can_delete": analytics_count == 0 and shelf_count == 0,
    }


@router.get("")
def list_stores(
    db: Session = Depends(get_db),
    admin_user: model.User = Depends(require_admin),
):
    stores = db.query(model.Store).order_by(model.Store.store_name).all()
    return [_store_summary(store, db) for store in stores]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_store(
    payload: StorePayload,
    db: Session = Depends(get_db),
    admin_user: model.User = Depends(require_admin),
):
    duplicate = db.query(model.Store).filter(model.Store.store_name.ilike(payload.store_name.strip())).first()
    if duplicate:
        raise HTTPException(status_code=409, detail="A store with this name already exists.")

    store = model.Store(
        store_name=payload.store_name.strip(),
        location=payload.location.strip(),
        manager_name=payload.manager_name.strip() if payload.manager_name else None,
        total_shelves=0,
        total_cameras=0,
        is_live_store=True,
    )
    db.add(store)
    db.commit()
    db.refresh(store)
    return _store_summary(store, db)


@router.delete("/{store_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_store(
    store_id: int,
    db: Session = Depends(get_db),
    admin_user: model.User = Depends(require_admin),
):
    store = db.query(model.Store).filter(model.Store.id == store_id, model.Store.is_live_store.is_(True)).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found.")

    summary = _store_summary(store, db)
    users = db.query(model.User).filter(model.User.store_id == store_id).count()
    cameras = db.query(model.Camera).filter(model.Camera.store_id == store_id).count()
    if summary["analytics_rows"] or summary["shelves"] or users or cameras:
        raise HTTPException(
            status_code=409,
            detail="This store has linked analytics, shelves, users, or cameras and cannot be deleted.",
        )

    db.delete(store)
    db.commit()
