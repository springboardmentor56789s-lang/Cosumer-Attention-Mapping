from fastapi import APIRouter, Depends, HTTPException, Query
from app.schemas.dashboard import (
    StoreManagerMetrics, 
    RetailAnalystMetrics, 
    MarketingManagerMetrics, 
    AdminMetrics,
    DashboardResponse
)

router = APIRouter()

@router.get("/store-manager", response_model=StoreManagerMetrics)
async def get_store_manager_dashboard(
    store_id: str = Query(..., description="Target Store Identifier"),
    time_frame: str = Query("today", description="today, week, month")
):
    """
    Returns traffic analytics, shelf performance, and conversion metrics[cite: 1].
    """
    # Mocked aggregation pipeline query (replace with MongoDB/PostgreSQL/TimescaleDB queries)
    return StoreManagerMetrics(
        total_foot_traffic=1420,
        avg_dwell_time_seconds=184.5,
        total_product_pickups=630,
        conversion_rate_percentage=44.3,
        hourly_traffic=[
            {"time": "09:00", "count": 85},
            {"time": "11:00", "count": 210},
            {"time": "13:00", "count": 340},
            {"time": "15:00", "count": 410},
            {"time": "17:00", "count": 375}
        ],
        top_performing_shelves=[
            {"shelf_id": "Shelf-A3 (Beverages)", "score": 92.4},
            {"shelf_id": "Shelf-B1 (Snacks)", "score": 87.1},
            {"shelf_id": "Shelf-C2 (Personal Care)", "score": 79.8}
        ]
    )

@router.get("/retail-analyst", response_model=RetailAnalystMetrics)
async def get_retail_analyst_dashboard(store_id: str):
    """
    Returns consumer behavior analytics, attention heatmap scores, and journey metrics[cite: 1].
    """
    return RetailAnalystMetrics(
        consumer_segments={
            "Explorers": 320,
            "Quick Buyers": 610,
            "Comparison Shoppers": 290,
            "Impulse Buyers": 200
        },
        heatmap_zones=[
            {"zone_id": "Entrance Display", "attention_score": 95.2},
            {"zone_id": "Promo Aisle 1", "attention_score": 84.1},
            {"zone_id": "Endcap B", "attention_score": 71.0}
        ],
        attractiveness_scores=[
            {"product_name": "Brand A Energy Drink", "attractiveness_score": 88.5},
            {"product_name": "Organic Chips", "attractiveness_score": 82.1}
        ],
        journey_dropoff_rates={
            "Passed Shelf": 100.0,
            "Looked at Product": 62.4,
            "Picked Up Product": 34.8,
            "Purchased Product": 28.2
        }
    )

@router.get("/marketing-manager", response_model=MarketingManagerMetrics)
async def get_marketing_manager_dashboard(store_id: str):
    """
    Returns campaign effectiveness, promotional performance, and visibility analytics[cite: 1].
    """
    return MarketingManagerMetrics(
        active_campaigns=4,
        promotional_visibility_score=81.6,
        campaign_engagement_rate=38.9,
        attractiveness_vs_conversion=[
            {"campaign": "Summer Promo", "visibility": 90.0, "conversion": 42.1},
            {"campaign": "New Snack Launch", "visibility": 78.4, "conversion": 31.5}
        ]
    )

@router.get("/admin", response_model=AdminMetrics)
async def get_admin_dashboard():
    """
    Returns system performance monitoring, camera node statuses, and health metrics[cite: 1].
    """
    return AdminMetrics(
        active_cameras=24,
        total_cameras=25,
        system_latency_ms=42.1,
        api_request_count=18450,
        camera_status_list=[
            {"camera_id": "CAM_01", "status": "ONLINE", "fps": "29.9"},
            {"camera_id": "CAM_02", "status": "ONLINE", "fps": "30.0"},
            {"camera_id": "CAM_03", "status": "OFFLINE", "fps": "0.0"}
        ]
    )