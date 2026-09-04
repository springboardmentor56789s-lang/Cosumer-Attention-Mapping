from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database.database import get_db
from app.services.dashboard_service import DashboardService

router = APIRouter(
    prefix="/dashboard",
    tags=["Executive Dashboards"]
)

@router.get("/stores")
def get_dashboard_stores(db: Session = Depends(get_db)):
    """Returns the list of stores for dashboard filtering."""
    return DashboardService.get_stores_filter_list(db)


@router.get("/store-manager")
def get_store_manager_view(
    store_id: Optional[int] = Query(None, description="Optional Store ID to filter"),
    time_range: str = Query("today", description="Time range filter"),
    db: Session = Depends(get_db)
):
    """
    Returns aggregated metrics tailored for Store Managers:
    - Traffic, journey time, top shelves, top products, conversion funnel, and hourly trends.
    """
    return DashboardService.get_store_manager_dashboard(db, store_id=store_id, time_range=time_range)


@router.get("/retail-analyst")
def get_retail_analyst_view(
    store_id: Optional[int] = Query(None, description="Optional Store ID to filter"),
    db: Session = Depends(get_db)
):
    """
    Returns behavioral intelligence tailored for Retail Analysts:
    - 5 Consumer segments, aggregate customer journeys, store zone heatmaps, and product attractiveness leaderboard.
    """
    return DashboardService.get_retail_analyst_dashboard(db, store_id=store_id)


@router.get("/marketing-manager")
def get_marketing_manager_view(
    store_id: Optional[int] = Query(None, description="Optional Store ID to filter"),
    db: Session = Depends(get_db)
):
    """
    Returns promotional and visibility insights for Marketing Managers:
    - High vs low visibility products, promotional AI recommendations, and category engagement metrics.
    """
    return DashboardService.get_marketing_manager_dashboard(db, store_id=store_id)


@router.get("/admin")
def get_admin_system_view(db: Session = Depends(get_db)):
    """
    Returns platform health, camera status, and infrastructure metrics for System Administrators.
    """
    return DashboardService.get_admin_dashboard(db)
