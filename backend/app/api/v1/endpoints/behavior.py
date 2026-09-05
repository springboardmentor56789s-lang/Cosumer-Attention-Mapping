from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.behavior_engine import BehaviorEngine

router = APIRouter()

@router.get("/{video_id}")
def get_video_behavior_analytics(video_id: int, db: Session = Depends(get_db)):
    """
    Returns consumer behavior intelligence analytics for a video (shopper metrics, journeys, zone analytics, patterns).
    """
    engine = BehaviorEngine(db)
    result = engine.analyze_video_behavior(video_id)
    return result
