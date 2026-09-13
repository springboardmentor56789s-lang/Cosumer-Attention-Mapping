from fastapi import APIRouter, Depends, Query
from typing import Optional
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.heatmap_engine import HeatmapEngine

router = APIRouter()

@router.get("/{video_id}")
def get_video_heatmaps(
    video_id: int,
    metric_type: Optional[str] = Query(None, description="movement, attention, or shelf"),
    zone_id: Optional[str] = Query(None),
    shelf_id: Optional[str] = Query(None),
    time_range: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Returns movement, attention, and shelf heatmaps generated from actual video coordinates.
    """
    engine = HeatmapEngine(db)
    result = engine.generate_heatmaps(video_id, metric_type=metric_type, zone_id=zone_id, shelf_id=shelf_id, time_range=time_range)
    return result
