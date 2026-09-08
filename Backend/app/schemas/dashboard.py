from pydantic import BaseModel
from typing import List, Optional, Dict

# Store Manager Dashboard Metrics
class StoreManagerMetrics(BaseModel):
    total_foot_traffic: int
    avg_dwell_time_seconds: float
    total_product_pickups: int
    conversion_rate_percentage: float
    hourly_traffic: List[Dict[str, int]]  # e.g., [{"time": "09:00", "count": 120}]
    top_performing_shelves: List[Dict[str, float]]

# Retail Analyst Dashboard Metrics
class RetailAnalystMetrics(BaseModel):
    consumer_segments: Dict[str, int]     # e.g., {"Explorers": 35, "Quick Buyers": 50}
    heatmap_zones: List[Dict[str, float]] # e.g., [{"zone_id": "Zone_A", "attention_score": 88.5}]
    attractiveness_scores: List[Dict[str, float]]
    journey_dropoff_rates: Dict[str, float]

# Marketing Manager Dashboard Metrics
class MarketingManagerMetrics(BaseModel):
    active_campaigns: int
    promotional_visibility_score: float
    campaign_engagement_rate: float
    attractiveness_vs_conversion: List[Dict[str, float]]

# Admin Dashboard Metrics
class AdminMetrics(BaseModel):
    active_cameras: int
    total_cameras: int
    system_latency_ms: float
    api_request_count: int
    camera_status_list: List[Dict[str, str]]

class DashboardResponse(BaseModel):
    role: str
    store_id: str
    data: Dict