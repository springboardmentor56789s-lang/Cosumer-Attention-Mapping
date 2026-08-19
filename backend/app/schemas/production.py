from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class StoreCreate(BaseModel):
    store_name: str
    location: str
    manager_name: Optional[str] = None
    logo_url: Optional[str] = None
    theme: Optional[str] = "default"
    is_live_store: bool = True


class StoreUpdate(StoreCreate):
    store_name: Optional[str] = None
    location: Optional[str] = None


class StoreResponse(StoreCreate):
    id: int
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class ShelfCreate(BaseModel):
    shelf_name: str
    shelf_number: str
    store_id: int
    category: Optional[str] = None
    aisle: Optional[str] = None
    capacity: int = 0
    status: str = "Active"


class ShelfUpdate(ShelfCreate):
    shelf_name: Optional[str] = None
    shelf_number: Optional[str] = None
    store_id: Optional[int] = None


class ShelfResponse(ShelfCreate):
    id: int
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class ProductCreate(BaseModel):
    name: str
    sku: str
    shelf_id: int
    category: Optional[str] = None


class ProductUpdate(ProductCreate):
    name: Optional[str] = None
    sku: Optional[str] = None
    shelf_id: Optional[int] = None


class ProductResponse(ProductCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)


class CameraCreate(BaseModel):
    camera_name: str
    store_id: int
    rtsp_url: str
    location: str
    camera_type: str = "rtsp"
    video_path: Optional[str] = None
    fps: Optional[float] = 0.0
    processing_status: str = "Idle"
    current_detection_status: str = "Idle"
    status: str = "Offline"


class CameraUpdate(CameraCreate):
    camera_name: Optional[str] = None
    store_id: Optional[int] = None
    rtsp_url: Optional[str] = None
    location: Optional[str] = None
    camera_type: Optional[str] = None
    video_path: Optional[str] = None
    fps: Optional[float] = None
    processing_status: Optional[str] = None
    current_detection_status: Optional[str] = None
    status: Optional[str] = None


class CameraResponse(CameraCreate):
    id: int
    last_active_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class ReferenceFrame(BaseModel):
    width: int = Field(gt=0)
    height: int = Field(gt=0)


class RoiShape(BaseModel):
    type: str
    points: List[Dict[str, float]]
    reference_frame: Optional[ReferenceFrame] = None


class CameraZoneCreate(BaseModel):
    zone_name: str
    zone_code: Optional[str] = None
    roi: RoiShape


class CameraZoneUpdate(CameraZoneCreate):
    zone_name: Optional[str] = None
    roi: Optional[RoiShape] = None


class CameraZoneResponse(CameraZoneCreate):
    id: int
    camera_id: int
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class ZoneShelfCreate(BaseModel):
    shelf_name: str
    shelf_number: str
    roi: RoiShape
    category: Optional[str] = None
    aisle: Optional[str] = None
    capacity: int = 0
    status: str = "Active"


class ZoneShelfUpdate(BaseModel):
    shelf_name: Optional[str] = None
    shelf_number: Optional[str] = None
    roi: Optional[RoiShape] = None
    category: Optional[str] = None
    aisle: Optional[str] = None
    capacity: Optional[int] = None
    status: Optional[str] = None


class AnalyticsCreate(BaseModel):
    customer_id: int
    store_id: int
    camera_id: int
    shelf_id: Optional[int] = None
    viewed_product: Optional[str] = None
    dwell_time: Optional[float] = 0.0
    attention_score: Optional[float] = 0.0
    distance_to_shelf: Optional[float] = 0.0
    face_direction: Optional[str] = "forward"
    head_angle: Optional[float] = 0.0
    looking_at_shelf: bool = False
    looking_at_product: bool = False
    walking_speed: Optional[float] = 0.0
    customer_path: Optional[str] = ""
    timestamp: Optional[datetime] = None


class AnalyticsResponse(AnalyticsCreate):
    id: int
    visit_time: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class CustomerTrackCreate(BaseModel):
    customer_id: int
    store_id: int
    camera_id: int
    shelf_id: Optional[int] = None
    product_viewed: Optional[str] = None
    entry_time: Optional[datetime] = None
    exit_time: Optional[datetime] = None
    dwell_time: Optional[float] = 0.0
    distance_to_shelf: Optional[float] = 0.0
    face_direction: Optional[str] = "forward"
    head_angle: Optional[float] = 0.0
    looking_at_shelf: bool = False
    looking_at_product: bool = False
    walking_speed: Optional[float] = 0.0
    customer_path: Optional[str] = ""
    attention_score: Optional[float] = 0.0
    timestamp: Optional[datetime] = None


class CustomerTrackResponse(CustomerTrackCreate):
    id: int
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class HeatmapCreate(BaseModel):
    store_id: int
    camera_id: int
    shelf_id: Optional[int] = None
    coordinates: Dict[str, Any] = Field(default_factory=dict)
    heatmap_type: str = "movement"


class HeatmapResponse(HeatmapCreate):
    id: int
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class ReportCreate(BaseModel):
    report_name: str
    report_type: str
    store_id: Optional[int] = None
    filters: Dict[str, Any] = Field(default_factory=dict)
    file_path: Optional[str] = None


class ReportResponse(ReportCreate):
    id: int
    report_id: Optional[str] = None
    created_by: Optional[int] = None
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class SettingCreate(BaseModel):
    store_name: Optional[str] = None
    logo_url: Optional[str] = None
    theme: Optional[str] = None
    jwt_expiry_minutes: Optional[int] = None
    notification_enabled: Optional[bool] = None
    camera_detection_threshold: Optional[float] = None
    yolo_confidence: Optional[float] = None


class SettingResponse(SettingCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)
