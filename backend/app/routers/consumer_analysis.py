from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import model
from app.dependencies import require_admin
from database.database import get_db

router = APIRouter(prefix="/api/consumer-analysis", tags=["Consumer Analysis"])


@router.get("")
def get_consumer_analysis(db: Session = Depends(get_db), admin_user: model.User = Depends(require_admin)):
    tracks = db.query(model.CustomerTrack).order_by(model.CustomerTrack.created_at.desc()).limit(50).all()
    return {
        "customers": [
            {
                "customer_id": track.customer_id,
                "store_id": track.store_id,
                "camera_id": track.camera_id,
                "shelf_id": track.shelf_id,
                "product_viewed": track.product_viewed,
                "dwell_time": track.dwell_time,
                "attention_score": track.attention_score,
                "path": track.customer_path,
            }
            for track in tracks
        ]
    }
