from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Auth schemas (PRD V2.0 Compliance: Manager and Worker roles)
class UserLogin(BaseModel):
    email: str
    password: str
    expected_role: Optional[str] = "Manager"

class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str
    employee_id: str
    phone: Optional[str] = None
    role: str = "Manager" # "Manager" or "Worker"
    assigned_store: Optional[str] = "Store #101 (Flagship Seattle)"

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    employee_id: Optional[str] = None
    phone: Optional[str] = None
    assigned_store: Optional[str] = None
    is_email_verified: Optional[bool] = False
    is_phone_verified: Optional[bool] = False
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

class SendOTPRequest(BaseModel):
    target: str # Email address or Phone number
    channel: Optional[str] = "email" # "email" or "phone"
    purpose: Optional[str] = "authentication"

class SendOTPResponse(BaseModel):
    message: str
    target: str
    demo_otp: Optional[str] = None
    expires_in_seconds: int = 600


class VerifyOTPRequest(BaseModel):
    target: str
    code: str
    purpose: Optional[str] = "authentication"

class VerifyOTPResponse(BaseModel):
    message: str
    verified: bool
    target: str

class OTPLoginRequest(BaseModel):
    target: str # email or phone number
    code: str
    expected_role: Optional[str] = "Manager"


# Store schemas
class StoreBase(BaseModel):
    name: str
    city: str
    address: Optional[str] = None
    number_of_shelves: Optional[int] = 0
    active_cameras: Optional[int] = 0
    visitor_count: Optional[int] = 0
    status: Optional[str] = "Active"

class StoreCreate(StoreBase):
    pass

class StoreOut(StoreBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# Shelf schemas
class ShelfBase(BaseModel):
    store_id: int
    shelf_code: str
    category: str
    product_count: Optional[int] = 0
    attention_score: Optional[float] = 0.0
    occupancy_percentage: Optional[float] = 0.0
    camera_id: Optional[int] = None
    visibility_score: Optional[float] = 85.0
    shelf_ranking: Optional[int] = 1

class ShelfCreate(ShelfBase):
    pass

class ShelfOut(ShelfBase):
    id: int
    class Config:
        from_attributes = True

# Camera schemas
class CameraBase(BaseModel):
    store_id: int
    name: str
    location: str
    status: Optional[str] = "Online"
    ip_address: Optional[str] = None
    stream_url: Optional[str] = None
    health_status: Optional[str] = "Good"
    active_detections_count: Optional[int] = 0

class CameraCreate(CameraBase):
    pass

class CameraOut(CameraBase):
    id: int
    class Config:
        from_attributes = True

# Product schemas
class ProductBase(BaseModel):
    shelf_id: int
    name: str
    brand: str
    category: str
    price: Optional[float] = 0.0
    stock_status: Optional[str] = "In Stock"
    recognition_confidence: Optional[float] = 95.0
    views_count: Optional[int] = 0
    pickups_count: Optional[int] = 0
    purchases_count: Optional[int] = 0
    attention_score: Optional[float] = 0.0

class ProductCreate(ProductBase):
    pass

class ProductOut(ProductBase):
    id: int
    class Config:
        from_attributes = True

# Customer schemas
class CustomerOut(BaseModel):
    id: int
    store_id: int
    customer_code: str
    entry_time: datetime
    exit_time: Optional[datetime] = None
    current_zone: str
    dwell_time_seconds: int
    attention_score: float
    journey_json: Optional[str] = None
    class Config:
        from_attributes = True

# Heatmap schema
class HeatmapPointOut(BaseModel):
    id: int
    store_id: int
    zone_name: str
    x_coord: float
    y_coord: float
    intensity: float
    class Config:
        from_attributes = True

# Notification schema
class NotificationOut(BaseModel):
    id: int
    store_id: Optional[int] = None
    title: str
    message: str
    type: str
    severity: str
    is_read: bool
    created_at: datetime
    class Config:
        from_attributes = True

# Report schema
class ReportOut(BaseModel):
    id: int
    title: str
    report_type: str
    date_range: str
    generated_by: str
    file_url: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

class VideoOut(BaseModel):
    id: int
    file_name: str
    file_path: str
    uploaded_by: str
    status: str
    duration_seconds: float
    upload_date: Optional[datetime] = None
    class Config:
        from_attributes = True


# Analytics Summary schema
class DashboardAnalyticsOut(BaseModel):
    total_stores: int
    active_cameras: int
    active_customers: int
    products_detected: int
    avg_attention_score: float
    avg_dwell_time_minutes: float
    total_product_pickups: int
    overall_engagement_score: float
    total_shoppers: Optional[int] = 324
    avg_dwell_time_sec: Optional[float] = 38.0
    total_attention_events: Optional[int] = 682
    top_performing_shelf: Optional[str] = "Shelf B (Beverages)"
    top_attention_product: Optional[str] = "Sparkling Lemonade 6-Pack"
    peak_traffic_period: Optional[str] = "17:00 - 19:00"
    most_visited_zone: Optional[str] = "Beverage Zone"
    daily_visitors: List[dict]
    hourly_traffic: List[dict]
    product_distribution: List[dict]
    store_comparison: List[dict]
    shelf_engagement: List[dict]
    camera_health_summary: List[dict]
    recent_alerts: List[NotificationOut]
    ai_recommendations: List[dict]



# Milestone 3 Schemas
class BehaviorPatternOut(BaseModel):
    id: int
    video_id: int
    pattern_type: str
    description: str
    evidence: str
    confidence: float
    created_at: datetime
    class Config:
        from_attributes = True

class HeatmapDataOut(BaseModel):
    id: int
    video_id: int
    zone_id: Optional[str] = None
    metric_type: str
    coordinates: str
    created_at: datetime
    class Config:
        from_attributes = True

class ProductScoreOut(BaseModel):
    id: int
    video_id: int
    product_id: str
    product_name: str
    attention_events: int
    attention_duration: float
    dwell_time: float
    repeat_events: int
    attractiveness_score: float
    created_at: datetime
    class Config:
        from_attributes = True

class ZoneAnalyticOut(BaseModel):
    id: int
    video_id: int
    zone_id: str
    visitor_count: int
    dwell_time: float
    attention_events: int
    engagement_score: float
    created_at: datetime
    class Config:
        from_attributes = True

class RecommendationOut(BaseModel):
    id: int
    video_id: int
    category: str
    evidence: str
    condition: str
    recommendation: str
    confidence: str
    status: str
    created_at: datetime
    class Config:
        from_attributes = True

class RetailIntelligenceSummaryOut(BaseModel):
    video_id: int
    total_shoppers: int
    avg_dwell_sec: float
    max_dwell_sec: float
    total_attention_events: int
    top_performing_zone: str
    most_frequent_path: str
    shopper_metrics: dict
    customer_journeys: List[dict]
    zone_analytics: List[dict]
    behavior_patterns: List[dict]
    heatmaps: dict
    product_rankings: List[dict]
    product_scores_unavailable_reason: Optional[str] = None
    recommendations: List[dict]

