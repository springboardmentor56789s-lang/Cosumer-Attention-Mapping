from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.domain import Notification
from app.schemas.schemas import NotificationOut

router = APIRouter()

@router.get("", response_model=List[NotificationOut])
def get_notifications(db: Session = Depends(get_db)):
    return db.query(Notification).order_by(Notification.created_at.desc()).all()

@router.patch("/{notif_id}", response_model=NotificationOut)
def mark_read(notif_id: int, db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == notif_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return notif
