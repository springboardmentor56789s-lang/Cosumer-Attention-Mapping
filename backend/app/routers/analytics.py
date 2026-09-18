# app/routers/analytics.py

from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from bson import ObjectId

import os
from urllib.parse import quote

import cv2

from app.database import database
from app.dependencies import get_current_user

from app.ai.person_tracker import PersonTracker

from app.ai.behavior_analytics import (
    analyze_consumer_behavior
)

from app.ai.zone_analyzer import (
    ZoneAnalyzer
)

from app.ai.product_detector import (
    ProductDetector
)

from app.ai.product_attractiveness import (
    calculate_product_attractiveness
)

from app.ai.product_interaction import (
    analyze_product_interactions
)

from app.ai.recommendation import (
    generate_recommendations
)


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


# =========================================================
# OBJECT ID
# =========================================================

def safe_float(value, default=0.0):
    """Safely convert a value to float."""
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def valid_object_id(value):

    try:
        return ObjectId(value)

    except Exception:
        return None


# =========================================================
# HEATMAP URL HELPER
# =========================================================

def get_heatmap_url(heatmap_path):
    """
    Convert a backend filesystem path into a browser-accessible
    FastAPI static-file URL.

    Example:

    Windows path:
    C:\\Users\\shaik\\consumer-attention-mapping-system\\
    backend\\heatmap-output\\video_heatmap.jpg

    Becomes:

    /heatmap-output/video_heatmap.jpg
    """

    if not heatmap_path:
        return None

    heatmap_path = str(
        heatmap_path
    )

    # Already a complete URL
    if (
        heatmap_path.startswith("http://")
        or
        heatmap_path.startswith("https://")
    ):
        return heatmap_path

    # Extract only the filename
    filename = os.path.basename(
        heatmap_path
    )

    if not filename:
        return None

    # Make filename URL-safe
    filename = quote(
        filename
    )

    return (
        f"/heatmap-output/{filename}"
    )


# =========================================================
# PRODUCT ANALYSIS
# =========================================================

def analyze_products(
    video_path,
    people,
    width,
    height
):

    print(
        "\n========================================"
    )

    print(
        "STARTING PRODUCT ANALYSIS"
    )

    print(
        "========================================"
    )

    product_detector = ProductDetector(
        model_path="yolov8n.pt"
    )

    if product_detector.model is None:

        return {

            "status":
                "model_not_found",

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
                "Product detection model could not be loaded."
        }

    cap = cv2.VideoCapture(
        video_path
    )

    if not cap.isOpened():

        return {

            "status":
                "video_open_failed",

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
                "Could not open video for product analysis."
        }

    fps = cap.get(
        cv2.CAP_PROP_FPS
    )

    if fps <= 0:
        fps = 25.0

    sample_interval_frames = max(
        1,
        int(
            fps * 0.5
        )
    )

    frame_number = 0

    product_counter = {}

    total_detections = 0

    confidence_values = {}

    product_shoppers = {}

    product_frame_counts = {}

    # Keep sampled product centers for shopper-product temporal analysis.
    product_centers = {}

    try:

        while True:

            ret, frame = cap.read()

            if not ret:
                break

            frame_number += 1

            if (
                frame_number %
                sample_interval_frames
                != 0
            ):
                continue

            detections = (
                product_detector.detect_from_frame(
                    frame,
                    confidence=0.30
                )
            )

            if not detections:
                continue

            for detection in detections:

                product_name = (
                    detection.get(
                        "class_name",
                        "unknown"
                    )
                )

                confidence = float(
                    detection.get(
                        "confidence",
                        0
                    )
                )

                bbox = detection.get(
                    "bbox",
                    {}
                )

                center = detection.get(
                    "center",
                    {}
                )

                product_x = float(
                    center.get(
                        "x",
                        (
                            float(
                                bbox.get(
                                    "x1",
                                    0
                                )
                            )
                            +
                            float(
                                bbox.get(
                                    "x2",
                                    0
                                )
                            )
                        ) / 2
                    )
                )

                product_y = float(
                    center.get(
                        "y",
                        (
                            float(
                                bbox.get(
                                    "y1",
                                    0
                                )
                            )
                            +
                            float(
                                bbox.get(
                                    "y2",
                                    0
                                )
                            )
                        ) / 2
                    )
                )

                # -------------------------------------------------
                # Store sampled product center
                # -------------------------------------------------
                product_centers.setdefault(
                    product_name,
                    []
                ).append({
                    "x": product_x,
                    "y": product_y
                })

                # -------------------------------------------------
                # Count product
                # -------------------------------------------------

                product_counter[
                    product_name
                ] = (
                    product_counter.get(
                        product_name,
                        0
                    )
                    + 1
                )

                product_frame_counts[
                    product_name
                ] = (
                    product_frame_counts.get(
                        product_name,
                        0
                    )
                    + 1
                )

                confidence_values.setdefault(
                    product_name,
                    []
                )

                confidence_values[
                    product_name
                ].append(
                    confidence
                )

                total_detections += 1

                # -------------------------------------------------
                # Find nearby shopper
                # -------------------------------------------------

                nearest_shopper = None

                nearest_distance = None

                for (
                    shopper_id,
                    person
                ) in people.items():

                    if not isinstance(
                        person,
                        dict
                    ):
                        continue

                    path = person.get(
                        "path",
                        []
                    )

                    if not isinstance(
                        path,
                        list
                    ):
                        continue

                    for point in path:

                        if not isinstance(
                            point,
                            dict
                        ):
                            continue

                        try:

                            px = float(
                                point.get(
                                    "x",
                                    0
                                )
                            )

                            py = float(
                                point.get(
                                    "y",
                                    0
                                )
                            )

                        except (
                            TypeError,
                            ValueError
                        ):

                            continue

                        distance = (
                            (
                                px -
                                product_x
                            ) ** 2
                            +
                            (
                                py -
                                product_y
                            ) ** 2
                        ) ** 0.5

                        if (
                            nearest_distance
                            is None
                            or
                            distance <
                            nearest_distance
                        ):

                            nearest_distance = (
                                distance
                            )

                            nearest_shopper = (
                                str(
                                    shopper_id
                                )
                            )

                if nearest_shopper:

                    product_shoppers.setdefault(
                        product_name,
                        []
                    )

                    if (
                        nearest_shopper
                        not in
                        product_shoppers[
                            product_name
                        ]
                    ):

                        product_shoppers[
                            product_name
                        ].append(
                            nearest_shopper
                        )

    finally:

        cap.release()

    # =====================================================
    # BUILD PRODUCT SUMMARY
    # =====================================================

    products = []

    for (
        product_name,
        count
    ) in product_counter.items():

        values = confidence_values.get(
            product_name,
            []
        )

        average_confidence = 0.0

        if values:

            average_confidence = (
                sum(values) /
                len(values)
            )

        shoppers = (
            product_shoppers.get(
                product_name,
                []
            )
        )

        centers = product_centers.get(
            product_name,
            []
        )

        # Stable product-area anchor used by product interaction analysis.
        if centers:
            x_values = sorted(
                safe_float(point.get("x"))
                for point in centers
            )
            y_values = sorted(
                safe_float(point.get("y"))
                for point in centers
            )
            middle = len(x_values) // 2
            if len(x_values) % 2:
                center_x = x_values[middle]
                center_y = y_values[middle]
            else:
                center_x = (x_values[middle - 1] + x_values[middle]) / 2
                center_y = (y_values[middle - 1] + y_values[middle]) / 2
            stable_center = {
                "x": round(center_x, 2),
                "y": round(center_y, 2)
            }
        else:
            stable_center = None

        products.append({

            "product":
                product_name,

            "detections":
                count,

            "average_confidence":
                round(
                    average_confidence,
                    3
                ),

            "unique_shoppers_near_product":
                len(shoppers),

            "shoppers":
                shoppers,

            "center":
                stable_center
        })

    products.sort(

        key=lambda item:
            item.get(
                "detections",
                0
            ),

        reverse=True
    )

    most_viewed = (
        products[0]["product"]
        if products
        else
        "No product detected"
    )

    highest_attention = (
        most_viewed
        if products
        else
        "No product detected"
    )

    result = {

        "status":
            "available"
            if products
            else
            "no_products_detected",

        "model":
            "yolov8n.pt",

        "model_type":
            "COCO general object detector",

        "most_viewed":
            most_viewed,

        "highest_attention":
            highest_attention,

        "unique_products_detected":
            len(products),

        "total_product_detections":
            total_detections,

        "products":
            products,

        "message":
            (
                "Products are detected using the "
                "current YOLO model. Replace "
                "yolov8n.pt with a retail-trained "
                "model for SKU and brand recognition."
            )
    }

    print(
        "Products detected:",
        len(products)
    )

    print(
        "Total detections:",
        total_detections
    )

    print(
        "Most viewed:",
        most_viewed
    )

    print(
        "========================================\n"
    )

    return result


# =========================================================
# ANALYZE VIDEO
# =========================================================

@router.post(
    "/analyze/{video_id}"
)
async def analyze_video(
    video_id: str,
    current_user=Depends(
        get_current_user
    )
):

    # =====================================================
    # VALIDATE ID
    # =====================================================

    object_id = valid_object_id(
        video_id
    )

    if object_id is None:

        raise HTTPException(
            status_code=400,
            detail="Invalid video ID."
        )

    # =====================================================
    # FIND VIDEO
    # =====================================================

    video = await database.videos.find_one({

        "_id":
            object_id
    })

    if video is None:

        raise HTTPException(
            status_code=404,
            detail="Video not found."
        )

    # =====================================================
    # OWNER
    # =====================================================

    owner = video.get(
        "owner"
    )

    current_email = (

        current_user.get(
            "email"
        )

        if isinstance(
            current_user,
            dict
        )

        else None
    )

    if (
        owner
        and
        current_email
        and
        owner != current_email
    ):

        raise HTTPException(
            status_code=403,
            detail=(
                "You do not have access "
                "to this video."
            )
        )

    # =====================================================
    # VIDEO PATH
    # =====================================================

    video_path = (

        video.get(
            "filepath"
        )

        or

        video.get(
            "file_path"
        )

        or

        video.get(
            "path"
        )
    )

    if not video_path:

        raise HTTPException(
            status_code=400,
            detail=(
                "Video file path is missing."
            )
        )

    video_path = os.path.abspath(
        video_path
    )

    if not os.path.exists(
        video_path
    ):

        raise HTTPException(
            status_code=404,
            detail=(
                "Video file does not exist: "
                f"{video_path}"
            )
        )

    # =====================================================
    # STEP 1 - PERSON TRACKING
    # =====================================================

    try:

        print(
            "\n========================================"
        )

        print(
            "STEP 1: PERSON TRACKING"
        )

        print(
            "========================================"
        )

        tracker = PersonTracker()

        tracking_result = (
            tracker.track_video(
                video_path
            )
        )

    except Exception as e:

        raise HTTPException(

            status_code=500,

            detail=(
                "Person tracking failed: "
                f"{str(e)}"
            )
        )

    if not isinstance(
        tracking_result,
        dict
    ):

        raise HTTPException(
            status_code=500,
            detail=(
                "PersonTracker returned "
                "invalid data."
            )
        )

    # =====================================================
    # VIDEO INFO
    # =====================================================

    video_analysis = (
        tracking_result.get(
            "video_analysis",
            {}
        )
    )

    width = int(
        video_analysis.get(
            "video_width",
            0
        )
    )

    height = int(
        video_analysis.get(
            "video_height",
            0
        )
    )

    people = (
        tracking_result.get(
            "people",
            {}
        )
    )

    # =====================================================
    # STEP 2 - ZONE ANALYSIS
    # =====================================================

    try:

        print(
            "\n========================================"
        )

        print(
            "STEP 2: ZONE ANALYSIS"
        )

        print(
            "========================================"
        )

        zone_analyzer = ZoneAnalyzer(
            rows=2,
            columns=3
        )

        shelf_zone_analysis = (
            zone_analyzer.summarize_zones(
                people,
                width,
                height
            )
        )

    except Exception as e:

        print(
            "Zone analysis failed:",
            e
        )

        shelf_zone_analysis = {

            "status":
                "error",

            "message":
                str(e),

            "zones":
                {}
        }

    # =====================================================
    # STEP 3 - PRODUCT ANALYSIS
    # =====================================================

    try:

        print(
            "\n========================================"
        )

        print(
            "STEP 3: PRODUCT ANALYSIS"
        )

        print(
            "========================================"
        )

        product_analysis = (
            analyze_products(
                video_path,
                people,
                width,
                height
            )
        )

    except Exception as e:

        print(
            "Product analysis failed:",
            e
        )

        product_analysis = {

            "status":
                "error",

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
                str(e)
        }

    # =====================================================
    # STEP 4 - BEHAVIOR ANALYTICS
    # =====================================================

    try:

        print(
            "\n========================================"
        )

        print(
            "STEP 4: BEHAVIOR ANALYTICS"
        )

        print(
            "========================================"
        )

        behavior = (
            analyze_consumer_behavior(

                tracking_result,

                product_analysis=
                    product_analysis,

                shelf_zone_analysis=
                    shelf_zone_analysis
            )
        )

    except Exception as e:

        raise HTTPException(

            status_code=500,

            detail=(
                "Behavior analytics failed: "
                f"{str(e)}"
            )
        )

    # =====================================================
    # STEP 4.5 - PRODUCT INTERACTION ANALYSIS
    # =====================================================

    try:

        print(
            "\n========================================"
        )

        print(
            "STEP 4.5: PRODUCT INTERACTION ANALYSIS"
        )

        print(
            "========================================"
        )

        total_shoppers = (
            len(people)
            if isinstance(people, dict)
            else 0
        )

        product_interaction = (
            analyze_product_interactions(
                product_analysis=product_analysis,
                people=people,
                total_shoppers=total_shoppers
            )
        )

        # -------------------------------------------------
        # Merge interaction metrics into the existing
        # product analysis without removing any old fields.
        # This lets the existing attractiveness module use
        # pickup/repeat-engagement values when available.
        # -------------------------------------------------

        interaction_products = (
            product_interaction.get(
                "products",
                []
            )
        )

        interaction_by_product = {}

        for item in interaction_products:

            if not isinstance(item, dict):
                continue

            name = item.get(
                "product"
            )

            if name is not None:
                interaction_by_product[
                    str(name)
                ] = item

        existing_products = product_analysis.get(
            "products",
            []
        )

        if isinstance(existing_products, list):

            for product in existing_products:

                if not isinstance(product, dict):
                    continue

                product_name = str(
                    product.get(
                        "product",
                        product.get(
                            "class_name",
                            "unknown"
                        )
                    )
                )

                interaction_item = (
                    interaction_by_product.get(
                        product_name
                    )
                )

                if not interaction_item:
                    continue

                pickup = interaction_item.get(
                    "pickup",
                    {}
                )

                repeat = interaction_item.get(
                    "repeat_engagement",
                    {}
                )

                product[
                    "pickup_rate"
                ] = pickup.get(
                    "pickup_rate"
                )

                product[
                    "repeat_engagement_rate"
                ] = repeat.get(
                    "repeat_engagement_rate"
                )

                product[
                    "pickup_candidate_count"
                ] = pickup.get(
                    "pickup_candidate_count",
                    0
                )

                product[
                    "repeat_engagement_count"
                ] = repeat.get(
                    "repeat_engagement_count",
                    0
                )

        print(
            "Product interaction analysis completed."
        )

    except Exception as e:

        print(
            "Product interaction analysis failed:",
            e
        )

        product_interaction = {

            "status":
                "error",

            "products":
                [],

            "summary":
                {},

            "limitations": [
                str(e)
            ]
        }

    # =====================================================
    # STEP 5 - PRODUCT ATTRACTIVENESS
    # =====================================================

    try:

        print(
            "\n========================================"
        )

        print(
            "STEP 5: PRODUCT ATTRACTIVENESS"
        )

        print(
            "========================================"
        )

        # Total shoppers from the existing tracker result.
        total_shoppers = len(people) if isinstance(people, dict) else 0

        # Use the existing video metadata when available.
        fps = float(
            video_analysis.get(
                "fps",
                25.0
            ) or 25.0
        )

        total_frames = video_analysis.get(
            "total_frames",
            video_analysis.get(
                "frames_processed",
                0
            )
        )

        try:
            total_frames = float(total_frames or 0)
        except (TypeError, ValueError):
            total_frames = 0.0

        video_duration_seconds = (
            total_frames / fps
            if fps > 0 and total_frames > 0
            else 0.0
        )

        product_attractiveness = (
            calculate_product_attractiveness(
                product_analysis=product_analysis,
                total_shoppers=total_shoppers,
                video_duration_seconds=video_duration_seconds
            )
        )

        print(
            "Product attractiveness calculated."
        )

    except Exception as e:

        print(
            "Product attractiveness failed:",
            e
        )

        product_attractiveness = {

            "status":
                "error",

            "scoring_model": {
                "attention_duration": 0.35,
                "product_interaction_frequency": 0.25,
                "product_pickup_rate": 0.20,
                "repeat_engagement_rate": 0.20
            },

            "top_product":
                None,

            "top_product_score":
                0,

            "products":
                [],

            "data_limitations": [
                str(e)
            ]
        }

    # =====================================================
    # STEP 6 - RECOMMENDATION ENGINE
    # =====================================================

    try:

        print(
            "\n========================================"
        )

        print(
            "STEP 5: RECOMMENDATION ENGINE"
        )

        print(
            "========================================"
        )

        # -------------------------------------------------
        # Existing tracking values
        # -------------------------------------------------

        unique_people_tracked = (
            video_analysis.get(
                "unique_people_tracked",
                len(people)
            )
        )

        dwell_analysis = (
            tracking_result.get(
                "dwell_analysis",
                {}
            )
        )

        average_dwell_time = (
            dwell_analysis.get(
                "average_dwell_time_seconds",
                0
            )
        )

        max_dwell_time = (
            dwell_analysis.get(
                "max_dwell_time_seconds",
                0
            )
        )

        # -------------------------------------------------
        # HEATMAP
        # -------------------------------------------------

        heatmap_path = (
            tracking_result.get(
                "heatmap"
            )
        )

        # Convert filesystem path to URL
        heatmap_url = get_heatmap_url(
            heatmap_path
        )

        heatmap_available = bool(
            heatmap_url
        )

        print(
            "Heatmap filesystem path:",
            heatmap_path
        )

        print(
            "Heatmap browser URL:",
            heatmap_url
        )

        # -------------------------------------------------
        # Recommendations
        # -------------------------------------------------

        recommendations = (
            generate_recommendations(

                unique_people_tracked=
                    unique_people_tracked,

                average_dwell_time=
                    average_dwell_time,

                max_dwell_time=
                    max_dwell_time,

                shelf_zone_analysis=
                    shelf_zone_analysis,

                product_analysis=
                    product_analysis,

                behavior=
                    behavior
            )
        )

        print(
            "Recommendations generated:",
            len(recommendations)
        )

    except Exception as e:

        print(
            "Recommendation engine failed:",
            e
        )

        recommendations = []

        # Still make sure heatmap URL exists
        heatmap_path = (
            tracking_result.get(
                "heatmap"
            )
        )

        heatmap_url = get_heatmap_url(
            heatmap_path
        )

    # =====================================================
    # FINAL RESPONSE
    # =====================================================

    response = {

        "message":
            "Video analysis completed",

        "video_id":
            str(
                video["_id"]
            ),

        "owner":
            owner,

        "filename":
            video.get(
                "filename",
                os.path.basename(
                    video_path
                )
            ),

        # -------------------------------------------------
        # TRACKING
        # -------------------------------------------------

        "tracking": {

            "video_analysis":
                tracking_result.get(
                    "video_analysis",
                    {}
                ),

            "dwell_analysis":
                tracking_result.get(
                    "dwell_analysis",
                    {}
                ),

            "entry_exit":
                tracking_result.get(
                    "entry_exit",
                    {}
                ),

            "path_tracking":
                tracking_result.get(
                    "path_tracking",
                    {}
                ),

            "gaze_analysis":
                tracking_result.get(
                    "gaze_analysis",
                    {}
                ),

            "tracking_video":
                tracking_result.get(
                    "tracking_video"
                ),

            # IMPORTANT:
            # Return browser URL instead of
            # Windows filesystem path.
            "heatmap":
                heatmap_url
        },

        # -------------------------------------------------
        # BEHAVIOR
        # -------------------------------------------------

        "behavior_summary":
            behavior.get(
                "behavior_summary",
                {}
            ),

        "shopping_patterns":
            behavior.get(
                "shopping_patterns",
                {}
            ),

        "consumer_segments":
            behavior.get(
                "consumer_segments",
                {}
            ),

        "journey_analytics":
            behavior.get(
                "journey_analytics",
                {}
            ),

        "gaze_summary":
            behavior.get(
                "gaze_summary",
                {}
            ),

        # -------------------------------------------------
        # PRODUCT
        # -------------------------------------------------

        "product_preferences":
            behavior.get(
                "product_preferences",
                {}
            ),

        # -------------------------------------------------
        # PRODUCT INTERACTION
        # -------------------------------------------------

        "product_interaction":
            product_interaction,

        # -------------------------------------------------
        # PRODUCT ATTRACTIVENESS
        # -------------------------------------------------

        "product_attractiveness":
            product_attractiveness,

        # -------------------------------------------------
        # ZONE
        # -------------------------------------------------

        "shelf_zone_analysis":
            behavior.get(
                "shelf_zone_analysis",
                {}
            ),

        # -------------------------------------------------
        # BRAND
        # -------------------------------------------------

        "brand_loyalty":
            behavior.get(
                "brand_loyalty",
                {}
            ),

        # -------------------------------------------------
        # PEOPLE
        # -------------------------------------------------

        "people":
            tracking_result.get(
                "people",
                {}
            ),

        # -------------------------------------------------
        # RECOMMENDATIONS
        # -------------------------------------------------

        "recommendations":
            recommendations
    }

    # =====================================================
    # SAVE TO MONGODB
    # =====================================================

    try:

        await database.analytics.insert_one({

            "video_id":
                object_id,

            "owner":
                owner,

            "result":
                response
        })

        print(
            "Analytics saved to MongoDB."
        )

    except Exception as e:

        print(
            "Could not save analytics:",
            e
        )

    print(
        "\n========================================"
    )

    print(
        "ALL ANALYTICS COMPLETE"
    )

    print(
        "========================================\n"
    )

    return response


# =========================================================
# GET ANALYTICS
# =========================================================

@router.get("")
async def get_analytics(
    current_user=Depends(
        get_current_user
    )
):

    current_email = (

        current_user.get(
            "email"
        )

        if isinstance(
            current_user,
            dict
        )

        else None
    )

    query = {}

    if current_email:

        query["owner"] = (
            current_email
        )

    documents = []

    cursor = (
        database.analytics.find(
            query
        )
        .sort(
            "_id",
            -1
        )
    )

    async for document in cursor:

        document["_id"] = str(
            document["_id"]
        )

        if document.get(
            "video_id"
        ) is not None:

            document["video_id"] = str(
                document[
                    "video_id"
                ]
            )

        documents.append(
            document
        )

    return documents

