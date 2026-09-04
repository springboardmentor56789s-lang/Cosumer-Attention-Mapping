"""
backend/app/services/behavior_engine.py
Consumer Behaviour Intelligence Engine
"""
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any

ZONE_TRANSITIONS = {
    "Entrance":           {"Grocery & Snacks": 0.48, "Electronics": 0.28, "Apparel": 0.14, "Checkout": 0.10},
    "Grocery & Snacks":   {"Electronics": 0.38, "Apparel": 0.22, "Checkout": 0.32, "Exit": 0.08},
    "Electronics":        {"Grocery & Snacks": 0.42, "Apparel": 0.24, "Checkout": 0.28, "Exit": 0.06},
    "Apparel":            {"Electronics": 0.20, "Grocery & Snacks": 0.18, "Checkout": 0.52, "Exit": 0.10},
    "Checkout":           {"Exit": 0.88, "Grocery & Snacks": 0.12},
    "Exit":               {},
}

def _classify_persona(velocity, zones_visited, dwell_sec, gaze_fixations, touch_count, backtrack_count):
    deliberation_index = (gaze_fixations * 4.2) / max(dwell_sec, 1) * touch_count
    if backtrack_count >= 3:
        return {"persona": "Lost / Confused", "emoji": "❓", "description": "Erratic backtracking. Navigation unclear or product not found.", "purchase_probability": max(5, 20 - backtrack_count * 4), "color": "#E8654F"}
    elif velocity > 1.2 and zones_visited <= 2 and touch_count >= 1:
        return {"persona": "Mission Shopper", "emoji": "🎯", "description": "Direct, fast-moving shopper with a specific product in mind.", "purchase_probability": min(95, 70 + touch_count * 8 + zones_visited * 3), "color": "#5FAE86"}
    elif deliberation_index >= 0.6 or (touch_count >= 2 and gaze_fixations >= 5):
        return {"persona": "High-Intent Deliberator", "emoji": "🧐", "description": "Evaluating products deeply. Very high purchase probability.", "purchase_probability": min(97, 60 + gaze_fixations * 4 + touch_count * 6), "color": "#E8A33D"}
    else:
        return {"persona": "Casual Browser", "emoji": "🛍️", "description": "Exploring multiple zones without strong product intent.", "purchase_probability": max(10, 25 + zones_visited * 5 + touch_count * 10), "color": "#5B8DEF"}

def generate_shopper_dna_profiles(count: int = 12) -> List[Dict[str, Any]]:
    random.seed(42)
    zone_names = list(ZONE_TRANSITIONS.keys())[:-1]
    profiles = []
    for i in range(1, count + 1):
        zones_visited = random.randint(1, 5)
        visited_zones = random.sample(zone_names, min(zones_visited, len(zone_names)))
        dwell_sec = random.randint(90, 900)
        gaze_fixations = random.randint(1, 14)
        touch_count = random.randint(0, 5)
        backtrack_count = random.randint(0, 4)
        velocity = round(random.uniform(0.3, 1.8), 2)
        mood = random.choice(["Focused & Evaluating", "Relaxed & Exploring", "Impatient / Hurrying", "Curious & Engaged"])
        entry_time = (datetime.now() - timedelta(minutes=dwell_sec // 60 + random.randint(0, 30))).strftime("%I:%M %p")
        p = _classify_persona(velocity, zones_visited, dwell_sec, gaze_fixations, touch_count, backtrack_count)
        current_zone = visited_zones[-1] if visited_zones else "Entrance"
        transitions = ZONE_TRANSITIONS.get(current_zone, {})
        next_zone = max(transitions, key=transitions.get) if transitions else "Exit"
        profiles.append({
            "id": f"SHOPPER-{i:02d}", "persona": p["persona"], "emoji": p["emoji"],
            "description": p["description"], "purchase_probability": min(99, p["purchase_probability"]),
            "color": p["color"], "mood_signal": mood,
            "time_in_store_min": round(dwell_sec / 60, 1), "zones_visited": visited_zones,
            "gaze_fixations": gaze_fixations, "touch_events": touch_count,
            "items_returned": random.randint(0, min(touch_count, 2)),
            "backtrack_count": backtrack_count, "velocity_mps": velocity,
            "entry_time": entry_time, "current_zone": current_zone,
            "next_zone_prediction": next_zone,
            "next_zone_probability": int(transitions.get(next_zone, 0) * 100),
            "opportunity_alert": p["purchase_probability"] >= 75 and touch_count >= 1,
        })
    return profiles

def generate_purchase_funnel() -> Dict[str, Any]:
    passersby = 1480
    gaze = int(passersby * 0.61)
    touch = int(gaze * 0.38)
    cart = int(touch * 0.52)
    sale = int(cart * 0.91)
    return {
        "stages": [
            {"label": "Passersby (Impressions)", "icon": "👁️", "count": passersby, "pct": 100, "color": "#5B8DEF"},
            {"label": "Gaze Fixation (>1.5s)", "icon": "🔍", "count": gaze, "pct": round(gaze/passersby*100,1), "color": "#E8A33D"},
            {"label": "Product Touch / Pickup", "icon": "🖐️", "count": touch, "pct": round(touch/passersby*100,1), "color": "#5FAE86"},
            {"label": "Cart / Basket Addition", "icon": "🛒", "count": cart, "pct": round(cart/passersby*100,1), "color": "#9B72E8"},
            {"label": "Completed Purchase", "icon": "✅", "count": sale, "pct": round(sale/passersby*100,1), "color": "#5FAE86"},
        ],
        "dropoffs": {
            "impression_to_gaze": round((1-gaze/passersby)*100,1),
            "gaze_to_touch": round((1-touch/gaze)*100,1),
            "touch_to_cart": round((1-cart/touch)*100,1),
            "cart_to_purchase": round((1-sale/cart)*100,1),
        },
        "overall_visual_conversion": round(touch/max(gaze,1)*100,1),
        "abandonment_rate": round((1-cart/max(touch,1))*100,1),
    }

FRICTION_ALERTS_RAW = [
    {"product": "Electronics Showcase — Display A", "zone": "Electronics", "gaze_pct": 86, "touch_pct": 12, "type": "HIGH_GAZE_LOW_TOUCH", "severity": "critical", "revenue_lost_inr": 8600, "recommendation": "Possible price resistance or unclear specs. Recommend a 15% promotional tag."},
    {"product": "Premium Whiskey — Shelf C2", "zone": "Grocery & Snacks", "gaze_pct": 74, "touch_pct": 19, "type": "TOUCH_AND_RETURN", "severity": "high", "revenue_lost_inr": 5200, "recommendation": "Customers read label and return item. Add taste-test offer or bundle promotion."},
    {"product": "Aisle 3 — Winter Apparel End Cap", "zone": "Apparel", "gaze_pct": 8, "touch_pct": 2, "type": "DEAD_ZONE", "severity": "medium", "revenue_lost_inr": 4200, "recommendation": "Zero engagement despite high footfall. Rotate to seasonal hero items or add LED spotlight."},
    {"product": "POS Counter 2 Queue", "zone": "Checkout", "gaze_pct": 0, "touch_pct": 0, "type": "QUEUE_ABANDONMENT", "severity": "high", "revenue_lost_inr": 3500, "recommendation": "5 shoppers left before checkout. Open POS Counter 3 during peak hours."},
]
SEVERITY_COLOR = {"critical": "#E8654F", "high": "#E8A33D", "medium": "#5B8DEF", "low": "#5FAE86"}
TYPE_LABEL = {"HIGH_GAZE_LOW_TOUCH": "High Gaze / No Touch", "TOUCH_AND_RETURN": "Touch & Return", "DEAD_ZONE": "Dead Zone", "QUEUE_ABANDONMENT": "Queue Abandonment"}

def generate_friction_alerts() -> Dict[str, Any]:
    alerts = [{**a, "severity_color": SEVERITY_COLOR[a["severity"]], "type_label": TYPE_LABEL[a["type"]]} for a in FRICTION_ALERTS_RAW]
    return {"alerts": alerts, "total_estimated_leakage_inr": sum(a["revenue_lost_inr"] for a in alerts),
            "critical_count": sum(1 for a in alerts if a["severity"]=="critical"),
            "high_count": sum(1 for a in alerts if a["severity"]=="high"),
            "medium_count": sum(1 for a in alerts if a["severity"]=="medium")}

def generate_cxi_score() -> Dict[str, Any]:
    nav_score = max(0, 25 - 2 * 4)
    queue_score = max(0, 25 - 3.1 * 3)
    merch_score = 0.684 * 25
    engage_score = 0.612 * 25
    cxi = round(min(100, nav_score + queue_score + merch_score + engage_score), 1)
    grade = "A" if cxi >= 80 else "B" if cxi >= 65 else "C" if cxi >= 50 else "D"
    grade_color = "#5FAE86" if cxi >= 80 else "#E8A33D" if cxi >= 50 else "#E8654F"
    grade_label = "Excellent" if cxi >= 80 else "Good" if cxi >= 65 else "Needs Improvement" if cxi >= 50 else "Poor"
    return {
        "cxi_score": cxi, "grade": grade, "grade_color": grade_color, "grade_label": grade_label,
        "components": {"navigation_smoothness": round(nav_score,1), "checkout_velocity": round(queue_score,1), "merchandising_quality": round(merch_score,1), "shopper_engagement": round(engage_score,1)},
        "benchmarks": {"avg_dwell_min": 14.8, "dwell_vs_benchmark_min": 2.8, "camera_uptime_pct": 99.4, "golden_zone_pct": 68.4},
    }

def generate_store_mood() -> Dict[str, Any]:
    hour = datetime.now().hour
    if 9 <= hour < 11:   mood, emoji, color, risk = "Calm Morning Browsing", "😌", "#5B8DEF", "Low"
    elif 11 <= hour < 13: mood, emoji, color, risk = "Rising Engagement",    "🔥", "#E8A33D", "Medium"
    elif 13 <= hour < 15: mood, emoji, color, risk = "Peak Shopping Rush",   "⚡", "#E8654F", "High — Open extra POS"
    elif 15 <= hour < 18: mood, emoji, color, risk = "Steady Afternoon",     "🛍️", "#5FAE86", "Low"
    elif 18 <= hour < 21: mood, emoji, color, risk = "Evening Surge",        "🌆", "#E8A33D", "Medium"
    else:                 mood, emoji, color, risk = "Night Wind Down",      "🌙", "#8A93A6", "Low"
    return {"mood": mood, "emoji": emoji, "color": color, "risk_level": risk,
            "live_shopper_count": random.randint(12, 34), "timestamp": datetime.now().strftime("%I:%M %p")}

def generate_ai_actions() -> List[Dict[str, Any]]:
    return [
        {"priority": "URGENT", "color": "#E8654F", "icon": "🔴", "action": "Open POS Counter 3 immediately — 8 shoppers queuing, est. wait 6.2 mins."},
        {"priority": "HIGH",   "color": "#E8A33D", "icon": "🟡", "action": "Restock Electronics Showcase Shelf B — 3 units left, 86% gaze attention on this shelf."},
        {"priority": "HIGH",   "color": "#E8A33D", "icon": "🟡", "action": "SHOPPER-07 is High-Intent Deliberator (82% purchase prob) — send staff to assist or activate promo display."},
        {"priority": "MEDIUM", "color": "#5B8DEF", "icon": "🔵", "action": "Move beverage promo tag to Eye-Level Shelf 2 — current 3rd-shelf position losing 74% of gaze."},
        {"priority": "LOW",    "color": "#5FAE86", "icon": "🟢", "action": "Rotate Apparel end-cap display — no meaningful engagement in the last 2 hours."},
    ]

# ─────────────────────────────────────────────
# PRODUCT ATTRACTIVENESS SCORING ENGINE (Page 6 Formula)
# Product Attractiveness Score = 
#   35% Attention Duration + 25% Interaction Frequency + 
#   20% Product Pickup Rate + 15% Purchase Conversion Rate + 5% Repeat Engagement Rate
# ─────────────────────────────────────────────
SAMPLE_PRODUCTS = [
    {"sku": "SKU-BEV-001", "name": "Sparkling Citrus Energy Drink 330ml", "category": "Beverages", "zone": "Grocery & Snacks", "shelf": "Eye-Level (Golden Zone)", "attn_duration_score": 92.0, "interaction_freq_score": 85.0, "pickup_rate_score": 88.0, "conversion_rate_score": 82.0, "repeat_rate_score": 75.0, "price_inr": 120},
    {"sku": "SKU-ELE-042", "name": "Wireless Noise-Cancelling Headphones", "category": "Electronics", "zone": "Electronics", "shelf": "Top Feature Display", "attn_duration_score": 96.0, "interaction_freq_score": 68.0, "pickup_rate_score": 45.0, "conversion_rate_score": 38.0, "repeat_rate_score": 60.0, "price_inr": 4999},
    {"sku": "SKU-SNK-109", "name": "Artisan Roasted Almonds & Sea Salt", "category": "Snacks", "zone": "Grocery & Snacks", "shelf": "Reach Level", "attn_duration_score": 78.0, "interaction_freq_score": 74.0, "pickup_rate_score": 80.0, "conversion_rate_score": 76.0, "repeat_rate_score": 70.0, "price_inr": 250},
    {"sku": "SKU-BEV-008", "name": "Cold Brew Espresso Can 250ml", "category": "Beverages", "zone": "Grocery & Snacks", "shelf": "Eye-Level (Golden Zone)", "attn_duration_score": 88.0, "interaction_freq_score": 82.0, "pickup_rate_score": 84.0, "conversion_rate_score": 79.0, "repeat_rate_score": 65.0, "price_inr": 160},
    {"sku": "SKU-APP-201", "name": "Classic Cotton Oxford Shirt (Navy)", "category": "Apparel", "zone": "Apparel", "shelf": "Hanger Rack A2", "attn_duration_score": 62.0, "interaction_freq_score": 58.0, "pickup_rate_score": 50.0, "conversion_rate_score": 42.0, "repeat_rate_score": 40.0, "price_inr": 1499},
    {"sku": "SKU-SNK-055", "name": "Organic Gluten-Free Granola Bar", "category": "Snacks", "zone": "Grocery & Snacks", "shelf": "Bottom Shelf", "attn_duration_score": 38.0, "interaction_freq_score": 32.0, "pickup_rate_score": 28.0, "conversion_rate_score": 25.0, "repeat_rate_score": 30.0, "price_inr": 80},
]

def calculate_product_attractiveness() -> Dict[str, Any]:
    ranked = []
    for p in SAMPLE_PRODUCTS:
        # Weighted Scoring Model Formula
        score = (
            0.35 * p["attn_duration_score"] +
            0.25 * p["interaction_freq_score"] +
            0.20 * p["pickup_rate_score"] +
            0.15 * p["conversion_rate_score"] +
            0.05 * p["repeat_rate_score"]
        )
        score = round(score, 1)
        
        if score >= 80:
            tier, tier_color = "High Attractiveness (Star Product)", "#5FAE86"
        elif score >= 60:
            tier, tier_color = "Moderate Attractiveness (Steady Performer)", "#E8A33D"
        else:
            tier, tier_color = "Low Attractiveness (Underperforming)", "#E8654F"
            
        ranked.append({
            **p,
            "attractiveness_score": score,
            "tier": tier,
            "tier_color": tier_color
        })
        
    ranked.sort(key=lambda x: x["attractiveness_score"], reverse=True)
    return {
        "formula_weights": {
            "attention_duration_pct": 35,
            "interaction_frequency_pct": 25,
            "pickup_rate_pct": 20,
            "purchase_conversion_pct": 15,
            "repeat_engagement_pct": 5
        },
        "ranked_products": ranked,
        "avg_catalog_score": round(sum(p["attractiveness_score"] for p in ranked) / len(ranked), 1)
    }
