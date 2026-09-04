"""
backend/app/routers/behavior.py
Consumer Behaviour Intelligence API Endpoints
"""
from fastapi import APIRouter
from ..services.behavior_engine import (
    generate_shopper_dna_profiles,
    generate_purchase_funnel,
    generate_friction_alerts,
    generate_cxi_score,
    generate_store_mood,
    generate_ai_actions,
    calculate_product_attractiveness,
)

router = APIRouter(prefix="/api/behavior")

@router.get("/personas")
def get_shopper_personas():
    """Get all live shopper DNA profiles with persona classification and next-zone prediction."""
    profiles = generate_shopper_dna_profiles(count=12)
    opportunity_alerts = [p for p in profiles if p["opportunity_alert"]]
    return {
        "profiles": profiles,
        "total_active": len(profiles),
        "opportunity_alerts": opportunity_alerts,
        "persona_summary": {
            "Mission Shopper": sum(1 for p in profiles if p["persona"] == "Mission Shopper"),
            "High-Intent Deliberator": sum(1 for p in profiles if p["persona"] == "High-Intent Deliberator"),
            "Casual Browser": sum(1 for p in profiles if p["persona"] == "Casual Browser"),
            "Lost / Confused": sum(1 for p in profiles if p["persona"] == "Lost / Confused"),
        }
    }

@router.get("/funnel")
def get_purchase_funnel():
    """Get the 4-stage visual engagement and purchase conversion funnel."""
    return generate_purchase_funnel()

@router.get("/friction-alerts")
def get_friction_alerts():
    """Get merchandising friction anomalies and lost revenue opportunities."""
    return generate_friction_alerts()

@router.get("/cxi-score")
def get_cxi_score():
    """Get the Customer Experience Index (CXI) composite score for the store."""
    return generate_cxi_score()

@router.get("/store-mood")
def get_store_mood():
    """Get real-time store mood and risk level based on current time and traffic patterns."""
    return generate_store_mood()

@router.get("/ai-actions")
def get_ai_actions():
    """Get AI-generated ranked action commands for store staff right now."""
    return generate_ai_actions()

@router.get("/product-attractiveness")
def get_product_attractiveness():
    """Get product attractiveness rankings using the weighted scoring model."""
    return calculate_product_attractiveness()

@router.get("/full-report")
def get_full_behavior_report():
    """Get a complete behaviour intelligence report combining all modules."""
    return {
        "shopper_dna": generate_shopper_dna_profiles(count=12),
        "funnel": generate_purchase_funnel(),
        "friction": generate_friction_alerts(),
        "cxi": generate_cxi_score(),
        "store_mood": generate_store_mood(),
        "ai_actions": generate_ai_actions(),
        "product_attractiveness": calculate_product_attractiveness(),
    }
