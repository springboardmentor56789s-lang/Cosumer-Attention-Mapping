from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth, stores, shelves, cameras, products, customers, analytics, heatmaps, reports, notifications,
    behavior, heatmaps_v2, products_v2, recommendations, intelligence, copilot, video_upload
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(stores.router, prefix="/stores", tags=["Stores"])
api_router.include_router(shelves.router, prefix="/shelves", tags=["Shelves"])
api_router.include_router(cameras.router, prefix="/cameras", tags=["Cameras"])
api_router.include_router(products.router, prefix="/products", tags=["Products"])
api_router.include_router(customers.router, prefix="/customers", tags=["Customers"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(heatmaps.router, prefix="/heatmaps", tags=["Heatmaps"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(video_upload.router, prefix="/video", tags=["Video Upload Security"])

# Milestone 3 Endpoints
api_router.include_router(behavior.router, prefix="/behavior", tags=["Consumer Behavior"])
api_router.include_router(heatmaps_v2.router, prefix="/heatmaps-v2", tags=["Heatmaps V2"])
api_router.include_router(products_v2.router, prefix="/products-v2", tags=["Product Intelligence"])
api_router.include_router(recommendations.router, prefix="/recommendations-v2", tags=["Optimization Recommendations"])
api_router.include_router(intelligence.router, prefix="/intelligence", tags=["Retail Intelligence"])
api_router.include_router(copilot.router, prefix="/copilot", tags=["AI Copilot"])



