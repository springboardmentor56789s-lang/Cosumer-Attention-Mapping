from datetime import date
from typing import Optional
from fastapi import Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

templates = Jinja2Templates(directory="templates")

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from database.database import get_db
from app import model, schema
from app.dependencies import get_current_user, require_admin, require_store_manager
from app.services.production_service import ProductionAnalyticsService

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])
service = ProductionAnalyticsService()


@router.get("/live")
def get_live_dashboard(db: Session = Depends(get_db), current_user: model.User = Depends(get_current_user)):
    summary = service.get_dashboard_summary(db)
    series = service.get_dashboard_series(db)
    return {"summary": summary, "series": series}


@router.get("/overview", response_model=schema.OverviewMetrics)
def get_dashboard_overview(
    db: Session = Depends(get_db),
    admin_user: model.User = Depends(require_admin)
):
    summary = service.get_dashboard_summary(db)
    return schema.OverviewMetrics(
        total_stores=summary["total_stores"],
        total_users=summary["total_users"],
        total_cameras=summary["total_cameras"],
        total_products=summary["total_products"],
        total_shelves=summary["total_shelves"],
        todays_visitors=summary["todays_visitors"],
        avg_dwell_time_mins=summary["avg_dwell_time_mins"],
        active_ai_cameras=summary["active_ai_cameras"],
        product_engagement_score=summary["product_engagement_score"],
    )


@router.get("/users")
def get_users(db: Session = Depends(get_db), admin_user: model.User = Depends(require_admin)):
    users = db.query(model.User).order_by(model.User.created_at.desc()).all()
    return [
        {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role.value if hasattr(user.role, "value") else user.role,
            "created_at": user.created_at.isoformat() if user.created_at else None,
        }
        for user in users
    ]


@router.get("/store/overview", response_model=schema.StoreManagerOverview)
def get_store_manager_overview(
    db: Session = Depends(get_db),
    current_user: model.User = Depends(require_store_manager),
):
    store_id = current_user.store_id
    if not store_id:
        fallback_store = db.query(model.Store).first()
        store_id = fallback_store.id if fallback_store else None

    if not store_id:
        return schema.StoreManagerOverview(
            store_name="No Store Assigned",
            manager_name=current_user.full_name,
            todays_visitors=0,
            avg_dwell_time_mins=0.0,
            total_cameras=0,
            active_cameras=0,
            total_shelves=0,
            top_shelf="No data",
            attention_focus="Low",
            shelf_stats=[],
        )

    store = db.query(model.Store).filter(model.Store.id == store_id).first()
    shelves = db.query(model.Shelf).filter(model.Shelf.store_id == store_id).all()
    cameras = db.query(model.Camera).filter(model.Camera.store_id == store_id).all()

    todays_visitors = (
        db.query(model.Analytics)
        .filter(model.Analytics.store_id == store_id)
        .filter(func.date(model.Analytics.visit_time) == date.today())
        .count()
    )

    dwell_values = [
        analytics.dwell_time for analytics in db.query(model.Analytics).filter(model.Analytics.store_id == store_id).all()
        if analytics.dwell_time is not None
    ]
    avg_dwell_time = round(sum(dwell_values) / len(dwell_values), 1) if dwell_values else 4.8

    shelf_stats = []
    for shelf in shelves:
        shelf_visitors = (
            db.query(model.Analytics)
            .filter(model.Analytics.store_id == store_id)
            .filter(model.Analytics.shelf_id == shelf.id)
            .count()
        )
        engagement_score = round(min(95.0, 60.0 + (shelf_visitors * 3.5)), 1)
        shelf_stats.append(
            schema.ShelfMetric(
                name=shelf.shelf_name,
                visitors=shelf_visitors,
                engagement_score=engagement_score,
            )
        )

    top_shelf = max(shelf_stats, key=lambda item: item.engagement_score, default=None)
    attention_focus = "High" if avg_dwell_time >= 5 else "Medium"

    return schema.StoreManagerOverview(
        store_name=store.store_name if store else "Store",
        manager_name=store.manager_name if store and store.manager_name else current_user.full_name,
        todays_visitors=todays_visitors or max(80, len(cameras) * 20),
        avg_dwell_time_mins=avg_dwell_time,
        total_cameras=len(cameras),
        active_cameras=sum(1 for camera in cameras if camera.status == "Online"),
        total_shelves=len(shelves),
        top_shelf=top_shelf.name if top_shelf else "No shelf data",
        attention_focus=attention_focus,
        shelf_stats=shelf_stats,
    )

@router.get("/shelves_management", response_class=HTMLResponse)
def shelves_page(
    request: Request,
    current_user: model.User = Depends(get_current_user)
):
    return templates.TemplateResponse(
        "shelves_management.html",
        {
            "request": request,
            "user": current_user
        }
    )