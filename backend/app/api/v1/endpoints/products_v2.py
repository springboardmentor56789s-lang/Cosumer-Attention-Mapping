from fastapi import APIRouter, Depends, Query
from typing import Optional
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.product_scoring import ProductScoringEngine

router = APIRouter()

@router.get("/{video_id}/scores")
def get_product_attractiveness_scores(
    video_id: int,
    w1: Optional[float] = Query(0.30, description="Weight for Attention Frequency"),
    w2: Optional[float] = Query(0.30, description="Weight for Attention Duration"),
    w3: Optional[float] = Query(0.20, description="Weight for Visit Frequency"),
    w4: Optional[float] = Query(0.20, description="Weight for Repeat Attention"),
    db: Session = Depends(get_db)
):
    """
    Returns Product Attractiveness Scores, focus durations, and product rankings.
    """
    weights = {"w1": w1, "w2": w2, "w3": w3, "w4": w4}
    engine = ProductScoringEngine(db)
    result = engine.compute_product_attractiveness(video_id, weights=weights)
    return result
