"""
Product Attractiveness Analyzer
-------------------------------
Calculates product attractiveness from video-derived retail analytics.

Scoring model (100% total):
- Attention Duration       35%
- Product Interaction      25%
- Pickup Rate              20%
- Repeat Engagement        20%

Purchase Conversion Rate has been completely removed from this module.
It requires external POS/transaction data and is not part of the
video-only attractiveness score.
"""

from typing import Any, Dict, List, Optional


# =========================================================
# SCORING WEIGHTS
# =========================================================

WEIGHTS = {
    "attention_duration": 0.35,
    "product_interaction_frequency": 0.25,
    "product_pickup_rate": 0.20,
    "repeat_engagement_rate": 0.20,
}


# Product detection sampling interval used by the current pipeline.
# Product detection is performed on sampled frames approximately every
# 0.5 seconds in the current implementation.
DEFAULT_SAMPLE_INTERVAL_SECONDS = 0.5


# =========================================================
# HELPERS
# =========================================================

def safe_float(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def safe_int(value: Any, default: int = 0) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def clamp(
    value: float,
    minimum: float = 0.0,
    maximum: float = 100.0
) -> float:
    return max(minimum, min(maximum, value))


def first_number(
    item: Dict[str, Any],
    keys: List[str],
    default: Optional[float] = None
) -> Optional[float]:
    for key in keys:
        value = item.get(key)
        if value is None:
            continue
        try:
            return float(value)
        except (TypeError, ValueError):
            continue
    return default


# =========================================================
# SCORE LABEL
# =========================================================

def attractiveness_label(score: float) -> str:
    if score >= 80:
        return "Highly Attractive"
    if score >= 60:
        return "Attractive"
    if score >= 40:
        return "Moderately Attractive"
    if score >= 20:
        return "Low"
    return "Very Low"


# =========================================================
# PRODUCT SCORE
# =========================================================

def calculate_product_score(
    attention_duration: Optional[float],
    interaction_frequency: Optional[float],
    pickup_rate: Optional[float],
    repeat_engagement_rate: Optional[float]
) -> Dict[str, Any]:
    metrics = {
        "attention_duration": attention_duration,
        "product_interaction_frequency": interaction_frequency,
        "product_pickup_rate": pickup_rate,
        "repeat_engagement_rate": repeat_engagement_rate,
    }

    weighted_total = 0.0
    available_weight = 0.0
    available_metrics = []
    unavailable_metrics = []

    for metric_name, weight in WEIGHTS.items():
        value = metrics.get(metric_name)

        if value is None:
            unavailable_metrics.append(metric_name)
            continue

        value = clamp(safe_float(value))
        weighted_total += value * weight
        available_weight += weight
        available_metrics.append(metric_name)

    if available_weight <= 0:
        return {
            "score": None,
            "label": "Insufficient Data",
            "available_metrics": [],
            "unavailable_metrics": unavailable_metrics,
            "available_weight_percent": 0
        }

    # Normalize over metrics that actually exist, so unavailable data does
    # not silently reduce the product score.
    score = weighted_total / available_weight

    return {
        "score": round(clamp(score), 2),
        "label": attractiveness_label(score),
        "available_metrics": available_metrics,
        "unavailable_metrics": unavailable_metrics,
        "available_weight_percent": round(
            available_weight * 100,
            2
        )
    }


# =========================================================
# MAIN ANALYZER
# =========================================================

def calculate_product_attractiveness(
    product_analysis: Dict[str, Any],
    total_shoppers: int,
    video_duration_seconds: float
) -> Dict[str, Any]:
    """
    Calculate product attractiveness.

    Supported product fields include:
    - detections
    - unique_shoppers_near_product
    - shoppers
    - pickup_rate
    - repeat_engagement_rate

    Attention duration is estimated from product detection count using the
    current 0.5-second sampling interval.
    """

    if not isinstance(product_analysis, dict):
        product_analysis = {}

    products = product_analysis.get("products", [])
    if not isinstance(products, list):
        products = []

    total_shoppers = safe_int(total_shoppers)
    video_duration_seconds = max(
        0.0,
        safe_float(video_duration_seconds)
    )

    product_results = []

    for product in products:
        if not isinstance(product, dict):
            continue

        product_name = str(
            product.get(
                "product",
                product.get("class_name", "unknown")
            )
        )

        detections = safe_int(product.get("detections", 0))

        # -----------------------------------------------------
        # 1. Attention Duration
        # -----------------------------------------------------
        attention_duration_seconds = (
            detections * DEFAULT_SAMPLE_INTERVAL_SECONDS
            if detections > 0
            else None
        )

        if (
            attention_duration_seconds is not None
            and video_duration_seconds > 0
        ):
            attention_duration_score = clamp(
                (
                    attention_duration_seconds /
                    video_duration_seconds
                ) * 100
            )
        else:
            attention_duration_score = None

        # -----------------------------------------------------
        # 2. Product Interaction Frequency
        # -----------------------------------------------------
        unique_shoppers = first_number(
            product,
            [
                "unique_shoppers_near_product",
                "unique_shoppers",
            ]
        )

        if unique_shoppers is None:
            shoppers = product.get("shoppers", [])
            if isinstance(shoppers, list):
                unique_shoppers = float(len(set(map(str, shoppers))))

        if unique_shoppers is not None and total_shoppers > 0:
            interaction_frequency_score = clamp(
                (unique_shoppers / total_shoppers) * 100
            )
        else:
            interaction_frequency_score = None

        # -----------------------------------------------------
        # 3. Pickup Rate
        # -----------------------------------------------------
        pickup_rate = first_number(
            product,
            ["pickup_rate"]
        )
        if pickup_rate is not None:
            pickup_rate = clamp(pickup_rate)

        # -----------------------------------------------------
        # 4. Repeat Engagement Rate
        # -----------------------------------------------------
        repeat_rate = first_number(
            product,
            ["repeat_engagement_rate"]
        )
        if repeat_rate is not None:
            repeat_rate = clamp(repeat_rate)

        score_data = calculate_product_score(
            attention_duration=attention_duration_score,
            interaction_frequency=interaction_frequency_score,
            pickup_rate=pickup_rate,
            repeat_engagement_rate=repeat_rate
        )

        product_results.append({
            "product": product_name,
            "attention_duration_seconds": (
                round(attention_duration_seconds, 2)
                if attention_duration_seconds is not None
                else None
            ),
            "attention_duration_score": (
                round(attention_duration_score, 2)
                if attention_duration_score is not None
                else None
            ),
            "interaction_frequency_score": (
                round(interaction_frequency_score, 2)
                if interaction_frequency_score is not None
                else None
            ),
            "pickup_rate": pickup_rate,
            "repeat_engagement_rate": repeat_rate,
            "score": score_data["score"],
            "label": score_data["label"],
            "available_metrics": score_data["available_metrics"],
            "unavailable_metrics": score_data["unavailable_metrics"],
            "available_weight_percent": score_data[
                "available_weight_percent"
            ]
        })

    valid_products = [
        item for item in product_results
        if item.get("score") is not None
    ]

    top_product = None
    top_product_score = 0

    if valid_products:
        top = max(
            valid_products,
            key=lambda item: safe_float(item.get("score"))
        )
        top_product = top.get("product")
        top_product_score = top.get("score") or 0

    return {
        "status": (
            "available"
            if product_results
            else "no_product_data"
        ),
        "scoring_model": {
            "attention_duration": 0.35,
            "product_interaction_frequency": 0.25,
            "product_pickup_rate": 0.20,
            "repeat_engagement_rate": 0.20
        },
        "top_product": top_product,
        "top_product_score": top_product_score,
        "products": product_results,
        "data_limitations": [
            "Pickup rate is an estimated candidate metric from video-based shopper-product association.",
            "Repeat engagement is estimated from separate shopper-product proximity sessions.",
            "Purchase conversion is not included in this scoring model because POS or transaction data is not available."
        ]
    }