from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.recommendation_engine import RecommendationEngine

router = APIRouter()

@router.get("/{video_id}")
def get_video_recommendations(video_id: int, db: Session = Depends(get_db)):
    """
    Returns evidence-backed optimization recommendations for store layout, shelf positioning,
    checkout staffing, and workforce allocation.
    """
    engine = RecommendationEngine(db)
    result = engine.generate_recommendations(video_id)
    return result
