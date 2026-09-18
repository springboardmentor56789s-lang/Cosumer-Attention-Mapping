# app/ai/behavior_analytics.py

from statistics import mean


# =========================================================
# SAFE FLOAT CONVERSION
# =========================================================

def _to_float(value, default=0.0):
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


# =========================================================
# SAFE INTEGER CONVERSION
# =========================================================

def _to_int(value, default=0):
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


# =========================================================
# PERCENTAGE
# =========================================================

def _percentage(value, total):
    if total <= 0:
        return 0

    return round(
        (value / total) * 100,
        2
    )


# =========================================================
# MAIN BEHAVIOR ANALYTICS
# =========================================================

def analyze_consumer_behavior(
    analytics: dict,
    product_analysis: dict = None,
    shelf_zone_analysis: dict = None
):
    """
    Generate dashboard-ready consumer behavior
    from the existing PersonTracker output.

    Uses real values from PersonTracker:

        - people
        - dwell_time_seconds
        - path_distance_pixels
        - movement_status
        - gaze
        - journey_segments
        - path
        - journey timing

    Optional:

        - product_analysis
        - shelf_zone_analysis
    """

    # =====================================================
    # SAFE INPUT
    # =====================================================

    if not isinstance(analytics, dict):
        analytics = {}

    if not isinstance(product_analysis, dict):
        product_analysis = {}

    if not isinstance(shelf_zone_analysis, dict):
        shelf_zone_analysis = {}

    # =====================================================
    # PEOPLE
    # =====================================================

    people = analytics.get(
        "people",
        {}
    )

    if not isinstance(people, dict):
        people = {}

    shopper_count = len(people)

    # =====================================================
    # EMPTY RESULT
    # =====================================================

    if shopper_count == 0:

        return {

            "behavior_summary": {
                "total_shoppers": 0,
                "average_dwell_time_seconds": 0,
                "average_movement_distance_pixels": 0,
                "average_journey_duration_seconds": 0
            },

            "shopping_patterns": {
                "browsing": 0,
                "comparison": 0,
                "quick_purchase": 0,
                "browsing_percentage": 0,
                "comparison_percentage": 0,
                "quick_purchase_percentage": 0
            },

            "consumer_segments": {
                "explorers": 0,
                "quick_buyers": 0,
                "comparison_shoppers": 0,
                "impulse_buyers": 0,
                "brand_loyal_customers": 0,

                "explorers_percentage": 0,
                "quick_buyers_percentage": 0,
                "comparison_shoppers_percentage": 0,
                "impulse_buyers_percentage": 0,
                "brand_loyal_customers_percentage": 0
            },

            "journey_analytics": {
                "total_shoppers": 0,
                "average_journey_duration_seconds": 0,
                "shopper_journeys": []
            },

            "gaze_summary": {
                "LEFT": 0,
                "RIGHT": 0,
                "CENTER": 0,
                "UP": 0,
                "DOWN": 0,
                "UNKNOWN": 0,

                "LEFT_percentage": 0,
                "RIGHT_percentage": 0,
                "CENTER_percentage": 0,
                "UP_percentage": 0,
                "DOWN_percentage": 0,
                "UNKNOWN_percentage": 0
            },

            "product_preferences": (
                product_analysis
                if product_analysis
                else {
                    "status": "not_available",
                    "most_viewed": "No product detected",
                    "highest_attention": "No product detected",
                    "unique_products_detected": 0,
                    "total_product_detections": 0,
                    "products": []
                }
            ),

            "shelf_zone_analysis": (
                shelf_zone_analysis
                if shelf_zone_analysis
                else {
                    "status": "not_available",
                    "zones": {}
                }
            ),

            "brand_loyalty": {
                "status": "insufficient_data",
                "brand_loyal_customers": 0,
                "brand_loyal_customers_percentage": 0,
                "message": (
                    "Brand loyalty requires repeated "
                    "customer visits or historical "
                    "interaction data."
                )
            }
        }

    # =====================================================
    # ARRAYS
    # =====================================================

    dwell_times = []

    movement_distances = []

    journey_durations = []

    shopper_journeys = []

    # =====================================================
    # SHOPPING PATTERNS
    # =====================================================

    browsing = 0

    comparison = 0

    quick_purchase = 0

    # =====================================================
    # CONSUMER SEGMENTS
    # =====================================================

    explorers = 0

    quick_buyers = 0

    comparison_shoppers = 0

    impulse_buyers = 0

    # =====================================================
    # GAZE
    # =====================================================

    gaze_summary = {

        "LEFT": 0,

        "RIGHT": 0,

        "CENTER": 0,

        "UP": 0,

        "DOWN": 0,

        "UNKNOWN": 0
    }

    # =====================================================
    # PROCESS EVERY PERSON
    # =====================================================

    for shopper_id, person in people.items():

        if not isinstance(person, dict):
            continue

        # =================================================
        # DWELL TIME
        # =================================================

        dwell_time = _to_float(
            person.get(
                "dwell_time_seconds",
                person.get(
                    "journey_duration_seconds",
                    0
                )
            )
        )

        dwell_times.append(
            dwell_time
        )

        # =================================================
        # MOVEMENT DISTANCE
        # =================================================

        movement_distance = _to_float(
            person.get(
                "path_distance_pixels",
                0
            )
        )

        movement_distances.append(
            movement_distance
        )

        # =================================================
        # JOURNEY DURATION
        # =================================================

        journey_duration = _to_float(
            person.get(
                "journey_duration_seconds",
                dwell_time
            )
        )

        journey_durations.append(
            journey_duration
        )

        # =================================================
        # GAZE
        # =================================================

        gaze_info = person.get(
            "gaze",
            {}
        )

        if isinstance(gaze_info, dict):

            gaze_direction = gaze_info.get(
                "gaze",
                "UNKNOWN"
            )

        else:

            gaze_direction = "UNKNOWN"

        gaze_direction = str(
            gaze_direction
        ).upper()

        if gaze_direction not in gaze_summary:

            gaze_direction = "UNKNOWN"

        gaze_summary[
            gaze_direction
        ] += 1

        # =================================================
        # SHOPPING PATTERN
        # =================================================
        #
        # These are heuristic classifications based
        # ONLY on dwell time.
        #
        # They are not claiming actual purchases.
        # =================================================

        if dwell_time >= 10:

            browsing += 1

        elif dwell_time >= 5:

            comparison += 1

        else:

            quick_purchase += 1

        # =================================================
        # CONSUMER SEGMENT
        # =================================================

        if dwell_time >= 10:

            explorers += 1

            segment = "Explorers"

        elif dwell_time >= 5:

            comparison_shoppers += 1

            segment = "Comparison Shoppers"

        elif dwell_time >= 2:

            quick_buyers += 1

            segment = "Quick Buyers"

        else:

            impulse_buyers += 1

            segment = "Impulse Buyers"

        # =================================================
        # JOURNEY TIMING
        # =================================================

        journey_start = _to_float(
            person.get(
                "journey_start_time_seconds",
                person.get(
                    "first_frame",
                    0
                )
            )
        )

        journey_end = _to_float(
            person.get(
                "journey_end_time_seconds",
                person.get(
                    "last_frame",
                    0
                )
            )
        )

        # =================================================
        # PATH
        # =================================================

        path = person.get(
            "path",
            []
        )

        if not isinstance(path, list):

            path = []

        # =================================================
        # SEGMENTS
        # =================================================

        journey_segments = person.get(
            "journey_segments",
            []
        )

        if not isinstance(
            journey_segments,
            list
        ):

            journey_segments = []

        # =================================================
        # MOVEMENT STATUS
        # =================================================

        movement_status = person.get(
            "movement_status",
            "UNKNOWN"
        )

        # =================================================
        # JOURNEY STATUS
        # =================================================

        if journey_end >= journey_start:

            journey_status = "Completed"

        else:

            journey_status = "In Progress"

        # =================================================
        # SHOPPER DETAIL
        # =================================================

        shopper_journeys.append({

            "shopper_id":
                str(shopper_id),

            "segment":
                segment,

            "dwell_time_seconds":
                round(
                    dwell_time,
                    2
                ),

            "journey_duration_seconds":
                round(
                    journey_duration,
                    2
                ),

            "movement_distance_pixels":
                round(
                    movement_distance,
                    2
                ),

            "movement_status":
                movement_status,

            "gaze_direction":
                gaze_direction,

            "journey_start_seconds":
                round(
                    journey_start,
                    2
                ),

            "journey_end_seconds":
                round(
                    journey_end,
                    2
                ),

            "path_points":
                len(path),

            "journey_segment_count":
                len(
                    journey_segments
                ),

            "journey_status":
                journey_status
        })

    # =====================================================
    # AVERAGES
    # =====================================================

    average_dwell = (

        round(
            mean(dwell_times),
            2
        )

        if dwell_times

        else 0
    )

    average_movement = (

        round(
            mean(movement_distances),
            2
        )

        if movement_distances

        else 0
    )

    average_journey_duration = (

        round(
            mean(journey_durations),
            2
        )

        if journey_durations

        else 0
    )

    # =====================================================
    # GAZE PERCENTAGES
    # =====================================================

    gaze_percentages = {}

    total_gaze = sum(
        gaze_summary.values()
    )

    for direction, count in gaze_summary.items():

        gaze_percentages[
            f"{direction}_percentage"
        ] = _percentage(
            count,
            total_gaze
        )

    gaze_summary.update(
        gaze_percentages
    )

    # =====================================================
    # PRODUCT RESULT
    # =====================================================

    if product_analysis:

        product_preferences = (
            product_analysis
        )

    else:

        product_preferences = {

            "status":
                "not_available",

            "most_viewed":
                "No product detected",

            "highest_attention":
                "No product detected",

            "unique_products_detected":
                0,

            "total_product_detections":
                0,

            "products":
                [],

            "message":
                (
                    "Product recognition requires "
                    "a retail-product detection model."
                )
        }

    # =====================================================
    # ZONE RESULT
    # =====================================================

    if shelf_zone_analysis:

        zone_result = (
            shelf_zone_analysis
        )

    else:

        zone_result = {

            "status":
                "not_available",

            "zones":
                {},

            "message":
                (
                    "Zone analysis data is not "
                    "available."
                )
        }

    # =====================================================
    # BRAND LOYALTY
    # =====================================================
    #
    # IMPORTANT:
    # PersonTracker creates temporary tracking IDs.
    #
    # It does NOT know whether ID 1 today is the
    # same customer as ID 1 in another video/day.
    #
    # Therefore we must NOT fabricate loyalty.
    # =====================================================

    brand_loyalty = {

        "status":
            "insufficient_data",

        "brand_loyal_customers":
            0,

        "brand_loyal_customers_percentage":
            0,

        "message":
            (
                "Brand loyalty requires repeated "
                "customer visits and brand/product "
                "interaction history."
            )
    }

    # =====================================================
    # FINAL RESPONSE
    # =====================================================

    return {

        # =================================================
        # BEHAVIOR SUMMARY
        # =================================================

        "behavior_summary": {

            "total_shoppers":
                shopper_count,

            "average_dwell_time_seconds":
                average_dwell,

            "average_movement_distance_pixels":
                average_movement,

            "average_journey_duration_seconds":
                average_journey_duration
        },

        # =================================================
        # SHOPPING PATTERNS
        # =================================================

        "shopping_patterns": {

            "browsing":
                browsing,

            "comparison":
                comparison,

            "quick_purchase":
                quick_purchase,

            "browsing_percentage":
                _percentage(
                    browsing,
                    shopper_count
                ),

            "comparison_percentage":
                _percentage(
                    comparison,
                    shopper_count
                ),

            "quick_purchase_percentage":
                _percentage(
                    quick_purchase,
                    shopper_count
                )
        },

        # =================================================
        # CONSUMER SEGMENTS
        # =================================================

        "consumer_segments": {

            "explorers":
                explorers,

            "quick_buyers":
                quick_buyers,

            "comparison_shoppers":
                comparison_shoppers,

            "impulse_buyers":
                impulse_buyers,

            "brand_loyal_customers":
                0,

            "explorers_percentage":
                _percentage(
                    explorers,
                    shopper_count
                ),

            "quick_buyers_percentage":
                _percentage(
                    quick_buyers,
                    shopper_count
                ),

            "comparison_shoppers_percentage":
                _percentage(
                    comparison_shoppers,
                    shopper_count
                ),

            "impulse_buyers_percentage":
                _percentage(
                    impulse_buyers,
                    shopper_count
                ),

            "brand_loyal_customers_percentage":
                0
        },

        # =================================================
        # JOURNEY ANALYTICS
        # =================================================

        "journey_analytics": {

            "total_shoppers":
                shopper_count,

            "average_journey_duration_seconds":
                average_journey_duration,

            "shopper_journeys":
                shopper_journeys
        },

        # =================================================
        # GAZE SUMMARY
        # =================================================

        "gaze_summary":
            gaze_summary,

        # =================================================
        # PRODUCT
        # =================================================

        "product_preferences":
            product_preferences,

        # =================================================
        # ZONES
        # =================================================

        "shelf_zone_analysis":
            zone_result,

        # =================================================
        # BRAND
        # =================================================

        "brand_loyalty":
            brand_loyalty
    }