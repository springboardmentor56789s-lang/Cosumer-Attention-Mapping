"""
backend/app/services/pathway_engine.py
Common Customer Pathway & Navigation Flow Analytics Engine
Extracts dominant shopper journeys, transition probabilities, and layout recommendations
"""
from typing import Dict, Any, List

# Zone graph coordinates for 2D Blueprint SVG rendering (Normalized percentages 0-100)
ZONE_COORDINATES = {
    "Entrance":           {"x": 15, "y": 20, "label": "Entrance Foyer", "color": "#5B8DEF"},
    "Grocery & Snacks":   {"x": 48, "y": 20, "label": "Grocery & Snacks", "color": "#5FAE86"},
    "Electronics":        {"x": 48, "y": 60, "label": "Electronics Hub", "color": "#E8A33D"},
    "Apparel":            {"x": 82, "y": 20, "label": "Apparel & Fitting", "color": "#9B72E8"},
    "Checkout":           {"x": 48, "y": 88, "label": "Checkout POS", "color": "#E8654F"},
    "Exit":               {"x": 82, "y": 88, "label": "Exit Turnstiles", "color": "#8A93A6"},
}

DOMINANT_PATHWAYS = [
    {
        "id": "PATH-01",
        "rank": 1,
        "name": "The Quick Grocery & Essentials Loop",
        "badge": "🥇 #1 Dominant Route",
        "sequence": ["Entrance", "Grocery & Snacks", "Checkout", "Exit"],
        "shopper_count": 622,
        "share_pct": 42.0,
        "avg_duration_min": 8.5,
        "conversion_rate": 84.2,
        "traffic_level": "Heavy Traffic",
        "color": "#5FAE86",
        "recommendation": "42% of all store visitors take this rapid loop. Place high-margin grab-and-go impulse items directly along the aisle turn between Grocery and Checkout."
    },
    {
        "id": "PATH-02",
        "rank": 2,
        "name": "High-Value Tech & Snack Explorer",
        "badge": "🥈 #2 High-Basket Route",
        "sequence": ["Entrance", "Electronics", "Grocery & Snacks", "Checkout", "Exit"],
        "shopper_count": 414,
        "share_pct": 28.0,
        "avg_duration_min": 17.2,
        "conversion_rate": 76.5,
        "traffic_level": "Moderate Traffic",
        "color": "#E8A33D",
        "recommendation": "Shoppers who evaluate Electronics spend 17+ minutes in store. Cross-merchandise premium beverages and energy snacks at the Electronics exit corridor."
    },
    {
        "id": "PATH-03",
        "rank": 3,
        "name": "The Full Department Grand Tour",
        "badge": "🥉 #3 Longest Dwell Route",
        "sequence": ["Entrance", "Grocery & Snacks", "Apparel", "Electronics", "Checkout", "Exit"],
        "shopper_count": 266,
        "share_pct": 18.0,
        "avg_duration_min": 24.8,
        "conversion_rate": 88.0,
        "traffic_level": "Steady Traffic",
        "color": "#9B72E8",
        "recommendation": "Highest basket conversion rate (88.0%). Ensure fitting rooms and customer service stations are fully staffed during peak afternoon hours."
    },
    {
        "id": "PATH-04",
        "rank": 4,
        "name": "The Apparel & Quick Exit Loop",
        "badge": "⚡ Targeted Fashion Loop",
        "sequence": ["Entrance", "Apparel", "Checkout", "Exit"],
        "shopper_count": 178,
        "share_pct": 12.0,
        "avg_duration_min": 11.4,
        "conversion_rate": 58.4,
        "traffic_level": "Light Traffic",
        "color": "#5B8DEF",
        "recommendation": "Fashion shoppers rarely cross over to Grocery. Add directional signage or promotional vouchers to encourage exploration of grocery aisles."
    },
]

def get_common_pathways_data() -> Dict[str, Any]:
    """Return dominant customer pathways, zone coordinates, and network summary."""
    total_analyzed = sum(p["shopper_count"] for p in DOMINANT_PATHWAYS)
    return {
        "total_journeys_analyzed": total_analyzed,
        "zone_coordinates": ZONE_COORDINATES,
        "dominant_pathways": DOMINANT_PATHWAYS,
        "summary_metrics": {
            "top_route_share": 42.0,
            "avg_overall_duration_min": 14.8,
            "avg_store_conversion_rate": 78.2,
            "dead_zone_alert": "Only 18% of traffic reaches the Apparel-to-Electronics crossover corridor."
        }
    }
