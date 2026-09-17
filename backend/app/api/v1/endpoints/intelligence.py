from fastapi import APIRouter, Depends, Query
from typing import Optional
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.behavior_engine import BehaviorEngine
from app.services.heatmap_engine import HeatmapEngine
from app.services.product_scoring import ProductScoringEngine
from app.services.recommendation_engine import RecommendationEngine
from app.services.report_generator import Milestone3ReportGenerator

router = APIRouter()

@router.get("/{video_id}")
@router.get("/summary/{video_id}")
def get_retail_intelligence_summary(
    video_id: int,
    db: Session = Depends(get_db)
):
    """
    Returns consolidated Retail Intelligence summary for Manager Dashboard.
    """
    behavior_engine = BehaviorEngine(db)
    heatmap_engine = HeatmapEngine(db)
    product_engine = ProductScoringEngine(db)
    rec_engine = RecommendationEngine(db)

    behavior_res = behavior_engine.analyze_video_behavior(video_id)
    heatmaps_res = heatmap_engine.generate_heatmaps(video_id)
    product_res = product_engine.compute_product_attractiveness(video_id)
    rec_res = rec_engine.generate_recommendations(video_id)

    total_shoppers = behavior_res["shopper_metrics"]["total_unique_shoppers"]
    avg_dwell = behavior_res["shopper_metrics"]["avg_dwell_time_sec"]
    max_dwell = behavior_res["shopper_metrics"]["max_dwell_time_sec"]
    total_attn = sum(z["attention_events"] for z in behavior_res["zone_analytics"])

    return {
        "video_id": video_id,
        "total_shoppers": total_shoppers,
        "avg_dwell_sec": avg_dwell,
        "max_dwell_sec": max_dwell,
        "total_attention_events": total_attn,
        "top_performing_zone": "Beverage Zone",
        "most_frequent_path": behavior_res["most_frequent_path"],
        "shopper_metrics": behavior_res["shopper_metrics"],
        "customer_journeys": behavior_res["customer_journeys"],
        "zone_analytics": behavior_res["zone_analytics"],
        "behavior_patterns": behavior_res["behavior_patterns"],
        "heatmaps": heatmaps_res,
        "product_rankings": product_res.get("product_rankings", []),
        "recommendations": rec_res,
        "is_data_available": True
    }

@router.get("/overview/{video_id}")
def get_behavior_overview(video_id: int, db: Session = Depends(get_db)):
    behavior_engine = BehaviorEngine(db)
    res = behavior_engine.analyze_video_behavior(video_id)
    return res["shopper_metrics"]

@router.get("/patterns-v2/{video_id}")
def get_behavior_patterns(video_id: int, db: Session = Depends(get_db)):
    behavior_engine = BehaviorEngine(db)
    res = behavior_engine.analyze_video_behavior(video_id)
    return res["behavior_patterns"]

@router.get("/heatmaps/{video_id}")
def get_intelligence_heatmaps(video_id: int, db: Session = Depends(get_db)):
    heatmap_engine = HeatmapEngine(db)
    return heatmap_engine.generate_heatmaps(video_id)

@router.get("/product-rankings-v2/{video_id}")
def get_product_rankings(video_id: int, db: Session = Depends(get_db)):
    product_engine = ProductScoringEngine(db)
    res = product_engine.compute_product_attractiveness(video_id)
    return res.get("product_rankings", [])

@router.get("/recommendations-v2/{video_id}")
def get_recommendations_v2(video_id: int, db: Session = Depends(get_db)):
    rec_engine = RecommendationEngine(db)
    return rec_engine.generate_recommendations(video_id)

@router.get("/reports/{video_id}")
def get_report_v2(video_id: int, db: Session = Depends(get_db)):
    generator = Milestone3ReportGenerator(db)
    return generator.generate_full_report(video_id)

@router.get("/zones/{video_id}/analytics")
def get_zone_analytics(video_id: int, db: Session = Depends(get_db)):
    """
    Returns zone traffic, dwell, and engagement comparisons.
    """
    behavior_engine = BehaviorEngine(db)
    res = behavior_engine.analyze_video_behavior(video_id)
    return res["zone_analytics"]

