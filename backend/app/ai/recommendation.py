# app/ai/recommendation.py


# =========================================================
# RECOMMENDATION & OPTIMIZATION ENGINE
# =========================================================

def generate_recommendations(
    unique_people_tracked,
    average_dwell_time,
    max_dwell_time,
    shelf_zone_analysis=None,
    product_analysis=None,
    behavior=None
):
    """
    Generate retail recommendations.

    IMPORTANT:
    This module only reads analytics results.
    It does NOT modify PersonTracker results.
    """

    recommendations = {
        "shelf_optimization": [],
        "product_placement": [],
        "promotional_placement": [],
        "consumer_engagement": [],
        "layout_improvement": []
    }

    # =====================================================
    # SAFE VALUES
    # =====================================================

    try:
        unique_people_tracked = int(
            unique_people_tracked or 0
        )
    except (TypeError, ValueError):
        unique_people_tracked = 0

    try:
        average_dwell_time = float(
            average_dwell_time or 0
        )
    except (TypeError, ValueError):
        average_dwell_time = 0.0

    try:
        max_dwell_time = float(
            max_dwell_time or 0
        )
    except (TypeError, ValueError):
        max_dwell_time = 0.0

    # =====================================================
    # SAFE DATA
    # =====================================================

    shelf_zone_analysis = (
        shelf_zone_analysis
        if isinstance(
            shelf_zone_analysis,
            dict
        )
        else {}
    )

    product_analysis = (
        product_analysis
        if isinstance(
            product_analysis,
            dict
        )
        else {}
    )

    behavior = (
        behavior
        if isinstance(
            behavior,
            dict
        )
        else {}
    )

    # =====================================================
    # ZONE DATA
    # =====================================================

    zones = shelf_zone_analysis.get(
        "zones",
        {}
    )

    if not isinstance(zones, dict):
        zones = {}

    # =====================================================
    # PRODUCT DATA
    # =====================================================

    products = product_analysis.get(
        "products",
        []
    )

    if not isinstance(products, list):
        products = []

    # =====================================================
    # 1. SHELF OPTIMIZATION
    # =====================================================

    if unique_people_tracked >= 20:

        recommendations[
            "shelf_optimization"
        ].append(
            "High shopper traffic detected. "
            "Prioritize high-visibility shelf positions "
            "in frequently visited areas."
        )

    elif unique_people_tracked >= 10:

        recommendations[
            "shelf_optimization"
        ].append(
            "Moderate shopper traffic detected. "
            "Continue monitoring shelf visibility "
            "and shopper movement."
        )

    else:

        recommendations[
            "shelf_optimization"
        ].append(
            "Low shopper traffic detected. "
            "Review shelf visibility, accessibility "
            "and product positioning."
        )

    # =====================================================
    # ZONE-BASED SHELF RECOMMENDATION
    # =====================================================

    zone_values = []

    for zone_name, zone_data in zones.items():

        if not isinstance(
            zone_data,
            dict
        ):
            continue

        try:

            shopper_count = int(
                zone_data.get(
                    "unique_shoppers",
                    0
                )
                or 0
            )

        except (
            TypeError,
            ValueError
        ):

            shopper_count = 0

        zone_values.append(
            (
                zone_name,
                shopper_count
            )
        )

    if zone_values:

        zone_values.sort(
            key=lambda item: item[1],
            reverse=True
        )

        highest_zone = zone_values[0]

        recommendations[
            "shelf_optimization"
        ].append(
            f"{highest_zone[0]} has the highest "
            f"shopper activity with "
            f"{highest_zone[1]} shoppers. "
            "Consider placing important products "
            "on highly visible shelves in this zone."
        )

        if len(zone_values) > 1:

            lowest_zone = zone_values[-1]

            if (
                lowest_zone[0]
                !=
                highest_zone[0]
            ):

                recommendations[
                    "layout_improvement"
                ].append(
                    f"{lowest_zone[0]} has comparatively "
                    f"low shopper activity "
                    f"({lowest_zone[1]} shoppers). "
                    "Review shelf arrangement and "
                    "aisle accessibility in this area."
                )

    # =====================================================
    # 2. PRODUCT PLACEMENT
    # =====================================================

    if products:

        product_list = []

        for product in products:

            if not isinstance(
                product,
                dict
            ):
                continue

            try:

                detections = int(
                    product.get(
                        "detections",
                        0
                    )
                    or 0
                )

            except (
                TypeError,
                ValueError
            ):

                detections = 0

            product_list.append(
                (
                    product,
                    detections
                )
            )

        product_list.sort(
            key=lambda item: item[1],
            reverse=True
        )

        if product_list:

            top_product = (
                product_list[0][0]
            )

            product_name = (
                top_product.get(
                    "product",
                    "Unknown product"
                )
            )

            detection_count = (
                product_list[0][1]
            )

            recommendations[
                "product_placement"
            ].append(
                f"{product_name} is the most frequently "
                f"detected product with "
                f"{detection_count} observations. "
                "Consider placing it in a high-traffic "
                "area for stronger visibility."
            )

        if len(product_list) >= 2:

            second_product = (
                product_list[1][0]
            )

            second_name = (
                second_product.get(
                    "product",
                    "Unknown product"
                )
            )

            recommendations[
                "product_placement"
            ].append(
                f"Review the placement of "
                f"{second_name} against other frequently "
                "observed products to improve shelf visibility."
            )

    else:

        recommendations[
            "product_placement"
        ].append(
            "No product detections are available. "
            "For accurate SKU-level placement analysis, "
            "use a retail-trained product detection model."
        )

    # =====================================================
    # 3. PROMOTIONAL PLACEMENT
    # =====================================================

    if unique_people_tracked >= 20:

        recommendations[
            "promotional_placement"
        ].append(
            "High shopper traffic provides a strong "
            "opportunity for promotional placement. "
            "Consider positioning promotional displays "
            "near high-traffic zones."
        )

    elif average_dwell_time >= 5:

        recommendations[
            "promotional_placement"
        ].append(
            "High shopper dwell time detected. "
            "Consider placing promotional messages "
            "or offers in areas where shoppers remain longer."
        )

    else:

        recommendations[
            "promotional_placement"
        ].append(
            "Use high-traffic and longer-dwell areas "
            "for promotional displays instead of "
            "low-activity locations."
        )

    # =====================================================
    # 4. CONSUMER ENGAGEMENT
    # =====================================================

    if average_dwell_time >= 5:

        recommendations[
            "consumer_engagement"
        ].append(
            "High average shopper dwell time detected. "
            "Consider interactive displays, product "
            "information or engaging promotional content."
        )

    elif average_dwell_time >= 2:

        recommendations[
            "consumer_engagement"
        ].append(
            "Moderate shopper dwell time detected. "
            "Monitor product interaction and consider "
            "improving product information and signage."
        )

    else:

        recommendations[
            "consumer_engagement"
        ].append(
            "Short shopper dwell times detected. "
            "Consider improving product visibility, "
            "signage and shelf presentation."
        )

    # =====================================================
    # LONG DWELL EVENT
    # =====================================================

    if max_dwell_time >= 8:

        recommendations[
            "consumer_engagement"
        ].append(
            "A long shopper dwell event was detected. "
            "Investigate the corresponding area for "
            "potential engagement opportunities."
        )

    # =====================================================
    # 5. LAYOUT IMPROVEMENT
    # =====================================================

    if unique_people_tracked >= 20:

        recommendations[
            "layout_improvement"
        ].append(
            "High shopper traffic detected. "
            "Keep major shopper paths clear and "
            "avoid unnecessary congestion."
        )

    elif unique_people_tracked >= 10:

        recommendations[
            "layout_improvement"
        ].append(
            "Shopper traffic is moderate. "
            "Continue monitoring zone-level movement "
            "before making major layout changes."
        )

    else:

        recommendations[
            "layout_improvement"
        ].append(
            "Overall shopper traffic is relatively low. "
            "Review aisle visibility, accessibility "
            "and store-zone arrangement."
        )

    # =====================================================
    # STATUS
    # =====================================================

    recommendations["status"] = "available"

    recommendations["message"] = (
        "Recommendations are generated from shopper "
        "traffic, dwell time, zone activity and "
        "available product analysis."
    )

    return recommendations