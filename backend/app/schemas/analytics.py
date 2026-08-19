from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict


class DetectionCreate(BaseModel):
    camera_id: int
    store_id: int
    shelf_id: Optional[int] = None
    zone_id: Optional[int] = None
    track_id: Optional[int] = None
    detected_class: str
    confidence: float
    bbox_x: int
    bbox_y: int
    bbox_w: int
    bbox_h: int


class DetectionResponse(DetectionCreate):
    id: int
    created_at: datetime
    class_name: Optional[str] = None
    bbox: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)


class AnalyticsSummary(BaseModel):
    total_detections: int
    recent_classes: List[str]
