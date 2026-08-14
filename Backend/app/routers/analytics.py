"""
backend/app/routers/analytics.py
Gaze Fixation Summaries, Heatmaps & Smart Retail Alerts
"""
from fastapi import APIRouter
from ..services.heatmap_engine import generate_floorplan_heatmap, generate_shelf_gaze_matrix

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/gaze-summary")
def get_gaze_summary():
    """Returns aggregate visual attention metrics across shelf levels."""
    sample_events = [
        {"gaze_target": "Eye-Level (Golden Zone)"},
        {"gaze_target": "Eye-Level (Golden Zone)"},
        {"gaze_target": "Top Shelf"},
        {"gaze_target": "Reach Level"},
        {"gaze_target": "Eye-Level (Golden Zone)"},
        {"gaze_target": "Bottom Shelf"},
    ]
    return generate_shelf_gaze_matrix(sample_events)

@router.get("/live-alerts")
def get_live_alerts():
    """Returns real-time congestion, loitering, and conversion alerts."""
    return {
        "alerts": [
            {
                "id": "ALT-101",
                "type": "congestion",
                "severity": "warning",
                "zone": "Entrance Aisle",
                "message": "Customer density exceeded threshold (8 persons/100sqft)",
                "time": "Just now",
            },
            {
                "id": "ALT-102",
                "type": "conversion_opportunity",
                "severity": "info",
                "zone": "Electronics Shelf B",
                "message": "High Gaze Fixation (84%) but 0 touches — recommend updating promotional signage",
                "time": "2 mins ago",
            },
        ]
    }