"""
Product Interaction Analyzer
----------------------------
Analyzes shopper-product interactions from video analytics.

Capabilities:
1. Detect likely pickup candidates from shopper/product proximity.
2. Detect repeat engagement only when the same shopper leaves and later
   returns to the same product area.
3. Calculate pickup rate.
4. Calculate repeat engagement rate.

Purchase conversion is intentionally NOT included. It requires POS or
transaction data and is outside this video-only module.
"""

from typing import Any, Dict, List, Optional


# =========================================================
# CONFIGURATION
# =========================================================

DEFAULT_INTERACTION_DISTANCE = 150.0

# Number of separate product-area sessions required to classify
# the shopper as a repeat engager.
DEFAULT_REPEAT_THRESHOLD = 2


# =========================================================
# SAFE HELPERS
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


# =========================================================
# SHOPPER PATH
# =========================================================

def get_shopper_path(person: Dict[str, Any]) -> List[Dict[str, Any]]:
    path = person.get("path", [])

    if not isinstance(path, list):
        return []

    return [
        point for point in path
        if isinstance(point, dict)
        and "x" in point
        and "y" in point
    ]


# =========================================================
# DISTANCE
# =========================================================

def calculate_distance(
    x1: float,
    y1: float,
    x2: float,
    y2: float
) -> float:
    return (
        (x1 - x2) ** 2 +
        (y1 - y2) ** 2
    ) ** 0.5


# =========================================================
# PRODUCT CENTER
# =========================================================

def get_product_center(
    product: Dict[str, Any]
) -> Optional[Dict[str, float]]:
    center = product.get("center")

    if isinstance(center, dict):
        return {
            "x": safe_float(center.get("x")),
            "y": safe_float(center.get("y"))
        }

    bbox = product.get("bbox")

    if isinstance(bbox, dict):
        x1 = safe_float(bbox.get("x1"))
        y1 = safe_float(bbox.get("y1"))
        x2 = safe_float(bbox.get("x2"))
        y2 = safe_float(bbox.get("y2"))

        return {
            "x": (x1 + x2) / 2,
            "y": (y1 + y2) / 2
        }

    return None


# =========================================================
# TEMPORAL SESSION DETECTION
# =========================================================

def count_proximity_sessions(
    path: List[Dict[str, Any]],
    product_center: Dict[str, float],
    interaction_distance: float = DEFAULT_INTERACTION_DISTANCE
) -> int:
    """
    Count separate visits to a product area from an ordered shopper path.

    Consecutive path points inside the interaction radius are treated as
    one continuous session. A new session starts only after the shopper
    leaves the radius and later comes back.
    """

    if not path:
        return 0

    sessions = 0
    inside_previous = False

    for point in path:
        px = safe_float(point.get("x"))
        py = safe_float(point.get("y"))

        distance = calculate_distance(
            px,
            py,
            product_center["x"],
            product_center["y"]
        )

        inside_now = distance <= interaction_distance

        if inside_now and not inside_previous:
            sessions += 1

        inside_previous = inside_now

    return sessions


# =========================================================
# FIND SHOPPER-PRODUCT INTERACTIONS
# =========================================================

def find_product_interactions(
    products: List[Dict[str, Any]],
    people: Dict[str, Any],
    interaction_distance: float = DEFAULT_INTERACTION_DISTANCE
) -> Dict[str, List[Dict[str, Any]]]:
    """
    Associate shoppers with detected products.

    Each interaction record now also carries:
    - minimum_distance
    - interaction_sessions
    - source

    The session count is based on the ordered tracking path. This prevents
    continuous proximity from being counted as repeated engagement.
    """

    interactions: Dict[str, List[Dict[str, Any]]] = {}

    if not isinstance(products, list) or not isinstance(people, dict):
        return interactions

    for product in products:
        if not isinstance(product, dict):
            continue

        product_name = str(
            product.get(
                "product",
                product.get("class_name", "unknown")
            )
        )

        product_center = get_product_center(product)

        # Existing product detector association remains supported.
        existing_shoppers = product.get("shoppers", [])
        if isinstance(existing_shoppers, list):
            for shopper_id in existing_shoppers:
                if shopper_id is None:
                    continue

                shopper_id = str(shopper_id)
                interactions.setdefault(product_name, [])

                already_added = any(
                    item.get("shopper_id") == shopper_id
                    for item in interactions[product_name]
                )

                if not already_added:
                    interactions[product_name].append({
                        "shopper_id": shopper_id,
                        "distance": None,
                        "interaction_sessions": None,
                        "source": "product_detector"
                    })

        if product_center is None:
            continue

        for shopper_id, person in people.items():
            if not isinstance(person, dict):
                continue

            path = get_shopper_path(person)
            if not path:
                continue

            distances = []
            for point in path:
                px = safe_float(point.get("x"))
                py = safe_float(point.get("y"))
                distances.append(
                    calculate_distance(
                        px,
                        py,
                        product_center["x"],
                        product_center["y"]
                    )
                )

            if not distances:
                continue

            minimum_distance = min(distances)
            sessions = count_proximity_sessions(
                path,
                product_center,
                interaction_distance
            )

            if minimum_distance <= interaction_distance:
                interactions.setdefault(product_name, [])

                shopper_id = str(shopper_id)

                existing = next(
                    (
                        item for item in interactions[product_name]
                        if item.get("shopper_id") == shopper_id
                    ),
                    None
                )

                if existing is None:
                    interactions[product_name].append({
                        "shopper_id": shopper_id,
                        "distance": round(minimum_distance, 2),
                        "interaction_sessions": sessions,
                        "source": "proximity"
                    })
                else:
                    # Prefer the richer temporal proximity information.
                    existing["distance"] = round(minimum_distance, 2)
                    existing["interaction_sessions"] = sessions
                    existing["source"] = "proximity"

    return interactions


# =========================================================
# PICKUP CANDIDATES
# =========================================================

def estimate_pickup_events(
    product_analysis: Dict[str, Any],
    interactions: Dict[str, List[Dict[str, Any]]]
) -> Dict[str, Dict[str, Any]]:
    """
    Estimate likely pickup candidates.

    This remains a candidate estimate because generic YOLO does not prove
    that a shopper physically picked up an item.
    """

    result: Dict[str, Dict[str, Any]] = {}
    products = product_analysis.get("products", [])

    if not isinstance(products, list):
        products = []

    for product in products:
        if not isinstance(product, dict):
            continue

        product_name = str(
            product.get(
                "product",
                product.get("class_name", "unknown")
            )
        )

        shoppers = interactions.get(product_name, [])
        shopper_ids = list(dict.fromkeys(
            str(item.get("shopper_id"))
            for item in shoppers
            if item.get("shopper_id") is not None
        ))

        detections = safe_int(product.get("detections", 0))
        pickup_candidates = []

        if detections >= 2:
            for shopper_id in shopper_ids:
                pickup_candidates.append({
                    "shopper_id": shopper_id,
                    "event": "pickup_candidate"
                })

        result[product_name] = {
            "pickup_candidates": pickup_candidates,
            "pickup_candidate_count": len(pickup_candidates),
            "method": "Temporal product-shopper association",
            "confidence": (
                "candidate"
                if pickup_candidates
                else "insufficient_data"
            )
        }

    return result


# =========================================================
# PICKUP RATE
# =========================================================

def calculate_pickup_rate(
    pickup_candidates: Dict[str, Dict[str, Any]],
    total_shoppers: int
) -> Dict[str, float]:
    result = {}
    total_shoppers = safe_int(total_shoppers)

    if total_shoppers <= 0:
        return result

    for product_name, data in pickup_candidates.items():
        candidates = safe_int(
            data.get("pickup_candidate_count", 0)
        )

        result[product_name] = round(
            clamp((candidates / total_shoppers) * 100),
            2
        )

    return result


# =========================================================
# REPEAT ENGAGEMENT
# =========================================================

def calculate_repeat_engagement(
    product_analysis: Dict[str, Any],
    interactions: Dict[str, List[Dict[str, Any]]],
    repeat_threshold: int = DEFAULT_REPEAT_THRESHOLD
) -> Dict[str, Dict[str, Any]]:
    """
    Calculate repeat engagement using separate proximity sessions.

    A shopper is repeat-engaged only when the tracking path shows at least
    `repeat_threshold` distinct visits to the product area.

    IMPORTANT: product detection count alone is NOT used as evidence of
    repeat engagement. A product being detected in many frames usually
    means it stayed visible; it does not mean the shopper returned.
    """

    result: Dict[str, Dict[str, Any]] = {}
    products = product_analysis.get("products", [])

    if not isinstance(products, list):
        products = []

    for product in products:
        if not isinstance(product, dict):
            continue

        product_name = str(
            product.get(
                "product",
                product.get("class_name", "unknown")
            )
        )

        shoppers = interactions.get(product_name, [])
        repeat_candidates = []
        session_counts: Dict[str, int] = {}
        temporal_evidence_available = False

        for item in shoppers:
            shopper_id = item.get("shopper_id")
            if shopper_id is None:
                continue

            sessions = item.get("interaction_sessions")

            if sessions is None:
                continue

            temporal_evidence_available = True
            sessions = safe_int(sessions)
            shopper_id = str(shopper_id)
            session_counts[shopper_id] = sessions

            if sessions >= repeat_threshold:
                repeat_candidates.append(shopper_id)

        repeat_candidates = list(dict.fromkeys(repeat_candidates))

        if temporal_evidence_available:
            confidence = (
                "estimated"
                if repeat_candidates
                else "no_repeat_detected"
            )
        else:
            confidence = "insufficient_temporal_data"

        result[product_name] = {
            "repeat_engagement_shoppers": repeat_candidates,
            "repeat_engagement_count": len(repeat_candidates),
            "interaction_session_counts": session_counts,
            "method": "Separate shopper-product proximity sessions",
            "confidence": confidence
        }

    return result


# =========================================================
# REPEAT ENGAGEMENT RATE
# =========================================================

def calculate_repeat_engagement_rate(
    repeat_engagement: Dict[str, Dict[str, Any]],
    interactions: Dict[str, List[Dict[str, Any]]]
) -> Dict[str, float]:
    result = {}

    for product_name, data in repeat_engagement.items():
        repeat_count = safe_int(
            data.get("repeat_engagement_count", 0)
        )

        product_interactions = interactions.get(product_name, [])

        interacting_shoppers = list(dict.fromkeys(
            str(item.get("shopper_id"))
            for item in product_interactions
            if item.get("shopper_id") is not None
        ))

        total_interacting = len(interacting_shoppers)

        # Do not invent a percentage when temporal session evidence is absent.
        if (
            total_interacting <= 0
            or data.get("confidence") == "insufficient_temporal_data"
        ):
            continue

        result[product_name] = round(
            clamp((repeat_count / total_interacting) * 100),
            2
        )

    return result


# =========================================================
# MAIN ANALYZER
# =========================================================

def analyze_product_interactions(
    product_analysis: Dict[str, Any],
    people: Dict[str, Any],
    total_shoppers: int
) -> Dict[str, Any]:
    if not isinstance(product_analysis, dict):
        product_analysis = {}

    if not isinstance(people, dict):
        people = {}

    products = product_analysis.get("products", [])
    if not isinstance(products, list):
        products = []

    interactions = find_product_interactions(
        products=products,
        people=people
    )

    pickup_candidates = estimate_pickup_events(
        product_analysis=product_analysis,
        interactions=interactions
    )

    pickup_rates = calculate_pickup_rate(
        pickup_candidates=pickup_candidates,
        total_shoppers=total_shoppers
    )

    repeat_engagement = calculate_repeat_engagement(
        product_analysis=product_analysis,
        interactions=interactions
    )

    repeat_engagement_rates = calculate_repeat_engagement_rate(
        repeat_engagement=repeat_engagement,
        interactions=interactions
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

        interaction_list = interactions.get(product_name, [])
        pickup_data = pickup_candidates.get(product_name, {})
        repeat_data = repeat_engagement.get(product_name, {})

        product_results.append({
            "product": product_name,
            "interaction": {
                "unique_shoppers": len(interaction_list),
                "shoppers": list(dict.fromkeys(
                    str(item.get("shopper_id"))
                    for item in interaction_list
                    if item.get("shopper_id") is not None
                ))
            },
            "pickup": {
                "pickup_candidate_count": pickup_data.get(
                    "pickup_candidate_count", 0
                ),
                "pickup_rate": pickup_rates.get(product_name),
                "status": pickup_data.get(
                    "confidence", "insufficient_data"
                )
            },
            "repeat_engagement": {
                "repeat_engagement_count": repeat_data.get(
                    "repeat_engagement_count", 0
                ),
                "repeat_engagement_rate": repeat_engagement_rates.get(
                    product_name
                ),
                "status": repeat_data.get(
                    "confidence", "insufficient_temporal_data"
                ),
                "interaction_session_counts": repeat_data.get(
                    "interaction_session_counts", {}
                )
            }
        })

    return {
        "status": (
            "available"
            if product_results
            else "no_product_interactions"
        ),
        "products": product_results,
        "summary": {
            "products_analyzed": len(product_results),
            "products_with_pickup_candidates": sum(
                1 for item in product_results
                if item["pickup"]["pickup_candidate_count"] > 0
            ),
            "products_with_repeat_engagement": sum(
                1 for item in product_results
                if item["repeat_engagement"]["repeat_engagement_count"] > 0
            )
        },
        "limitations": [
            "Pickup is an estimated candidate event based on temporal shopper-product association.",
            "Physical hand-to-product pickup cannot be guaranteed with the current general YOLO model.",
            "Repeat engagement is estimated from separate shopper-product proximity sessions."
        ]
    }
