from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models.domain import SpatialHeatmapPoint
from app.schemas.schemas import HeatmapPointOut

router = APIRouter()

@router.get("", response_model=List[HeatmapPointOut])
def get_heatmap(store_id: Optional[int] = None, zone_name: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(SpatialHeatmapPoint)
    if store_id:
        query = query.filter(SpatialHeatmapPoint.store_id == store_id)
    if zone_name:
        query = query.filter(SpatialHeatmapPoint.zone_name == zone_name)
    return query.limit(300).all()
