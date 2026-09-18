from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Depends,
    HTTPException
)

from bson import ObjectId
from datetime import datetime

import os
import shutil
import traceback

from app.database import database
from app.dependencies import get_current_user
from app.schemas import VideoUpdate

from app.ai.tracker import PersonTracker
from app.ai.recommendation import generate_recommendations

# =========================================================
# CONSUMER BEHAVIOR ANALYTICS
# =========================================================

from app.ai.behavior_analytics import analyze_consumer_behavior


router = APIRouter()


# =========================================================
# BASE DIRECTORIES
# =========================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )
)


# =========================================================
# UPLOAD FOLDER
# =========================================================

UPLOAD_FOLDER = os.path.join(
    BASE_DIR,
    "uploads"
)

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)


# =========================================================
# HEATMAP FOLDER
# =========================================================

HEATMAP_FOLDER = os.path.join(
    BASE_DIR,
    "heatmap-output"
)

os.makedirs(
    HEATMAP_FOLDER,
    exist_ok=True
)


# =========================================================
# PATH HELPER
# =========================================================

def get_absolute_video_path(file_path: str) -> str:

    if os.path.isabs(file_path):

        return file_path

    return os.path.abspath(
        os.path.join(
            BASE_DIR,
            file_path
        )
    )


# =========================================================
# 1. UPLOAD VIDEO
# =========================================================

@router.post("/upload-video")
async def upload_video(

    video: UploadFile = File(...),

    camera_id: str | None = None,

    current_user=Depends(
        get_current_user
    )

):

    try:

        # -------------------------------------------------
        # Validate filename
        # -------------------------------------------------

        if not video.filename:

            raise HTTPException(
                status_code=400,
                detail="No video file selected"
            )


        # -------------------------------------------------
        # Allowed formats
        # -------------------------------------------------

        allowed_extensions = (
            ".mp4",
            ".avi",
            ".mov",
            ".mkv",
            ".webm"
        )

        extension = os.path.splitext(
            video.filename
        )[1].lower()


        if extension not in allowed_extensions:

            raise HTTPException(
                status_code=400,
                detail="Unsupported video format"
            )


        # -------------------------------------------------
        # Validate camera
        # -------------------------------------------------

        camera = None

        if camera_id:

            try:

                camera = await database.cameras.find_one(
                    {
                        "_id": ObjectId(camera_id),
                        "owner": current_user["email"]
                    }
                )

            except Exception:

                raise HTTPException(
                    status_code=400,
                    detail="Invalid camera ID"
                )


            if camera is None:

                raise HTTPException(
                    status_code=404,
                    detail="Camera not found"
                )


        # -------------------------------------------------
        # Save ORIGINAL uploaded video
        # -------------------------------------------------

        file_path = os.path.join(
            UPLOAD_FOLDER,
            video.filename
        )


        with open(
            file_path,
            "wb"
        ) as buffer:

            shutil.copyfileobj(
                video.file,
                buffer
            )


        # -------------------------------------------------
        # Video database record
        # -------------------------------------------------

        video_data = {

            "filename":
                video.filename,

            "file_path":
                os.path.relpath(
                    file_path,
                    BASE_DIR
                ),

            "owner":
                current_user["email"],

            "processing_status":
                "Pending",

            "uploaded_at":
                datetime.utcnow().strftime(
                    "%Y-%m-%d %H:%M:%S"
                ),

            "tracking_video":
                None,

            "heatmap":
                None,

            "heatmap_file":
                None,

            "tracking_result":
                None,

            "recommendations":
                [],

            "behavior_analysis":
                None
        }


        # -------------------------------------------------
        # Associate video with camera
        # -------------------------------------------------

        if camera_id:

            video_data["camera_id"] = camera_id

            video_data["camera_name"] = (
                camera.get("camera_name")
                if camera
                else None
            )


        # -------------------------------------------------
        # Save to MongoDB
        # -------------------------------------------------

        result = await database.videos.insert_one(
            video_data
        )


        # -------------------------------------------------
        # ORIGINAL VIDEO URL
        # -------------------------------------------------

        original_video_url = (
            "/uploads/"
            + video.filename
        )


        return {

            "message":
                "Video uploaded successfully",

            "video_id":
                str(
                    result.inserted_id
                ),

            "filename":
                video.filename,

            "processing_status":
                "Pending",

            "camera_id":
                camera_id,

            "video_url":
                original_video_url,

            "file_path":
                video_data["file_path"]
        }


    except HTTPException:

        raise


    except Exception as e:

        print(
            "\n========== VIDEO UPLOAD ERROR =========="
        )

        traceback.print_exc()

        print(
            "========================================\n"
        )


        raise HTTPException(
            status_code=500,
            detail=f"Video upload failed: {str(e)}"
        )


# =========================================================
# 2. ANALYZE VIDEO
# =========================================================

@router.post("/analyze-video/{video_id}")
async def analyze_video(

    video_id: str,

    current_user=Depends(
        get_current_user
    )

):

    # -----------------------------------------------------
    # Validate ObjectId
    # -----------------------------------------------------

    try:

        object_id = ObjectId(
            video_id
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid video ID"
        )


    # -----------------------------------------------------
    # Find video
    # -----------------------------------------------------

    video = await database.videos.find_one(
        {
            "_id": object_id,
            "owner": current_user["email"]
        }
    )


    if video is None:

        raise HTTPException(
            status_code=404,
            detail="Video not found"
        )


    # -----------------------------------------------------
    # Original uploaded video path
    # -----------------------------------------------------

    stored_path = video.get(
        "file_path"
    )


    if not stored_path:

        raise HTTPException(
            status_code=404,
            detail="Video path not found"
        )


    video_path = get_absolute_video_path(
        stored_path
    )


    print(
        "\n========== VIDEO ANALYSIS =========="
    )

    print(
        "Video ID:",
        video_id
    )

    print(
        "Original video path:",
        video_path
    )

    print(
        "File exists:",
        os.path.exists(video_path)
    )

    print(
        "====================================\n"
    )


    if not os.path.exists(
        video_path
    ):

        await database.videos.update_one(

            {
                "_id":
                    object_id
            },

            {
                "$set":
                {
                    "processing_status":
                        "Failed",

                    "error":
                        "Video file not found"
                }
            }
        )


        raise HTTPException(
            status_code=404,
            detail=f"Video file not found: {video_path}"
        )


    try:

        # =================================================
        # PROCESSING STATUS
        # =================================================

        await database.videos.update_one(

            {
                "_id":
                    object_id
            },

            {
                "$set":
                {
                    "processing_status":
                        "Processing",

                    "error":
                        None
                }
            }
        )


        # =================================================
        # PERSON TRACKING
        # =================================================

        print(
            "\n========== PERSON TRACKING =========="
        )


        tracker = PersonTracker()


        result = tracker.track_video(
            video_path
        )


        # -------------------------------------------------
        # Safety
        # -------------------------------------------------

        if not isinstance(
            result,
            dict
        ):

            result = {}


        print(
            "Person tracking completed."
        )


        # =================================================
        # CONSUMER BEHAVIOR ANALYTICS
        # =================================================

        print(
            "\n========== CONSUMER BEHAVIOR ANALYTICS =========="
        )


        behavior_analysis = (
            analyze_consumer_behavior(
                result
            )
        )


        # -------------------------------------------------
        # Add behavior analytics
        # -------------------------------------------------

        result["behavior_analysis"] = (
            behavior_analysis
        )


        print(
            "Consumer behavior analytics completed."
        )

        print(
            "=================================================\n"
        )


        # =================================================
        # HEATMAP
        # =================================================
        #
        # IMPORTANT:
        #
        # PersonTracker ALREADY generated the heatmap.
        #
        # DO NOT call:
        #
        # HeatmapGenerator.generate_heatmap()
        #
        # again.
        #
        # =================================================

        print(
            "\n========== HEATMAP =========="
        )


        heatmap_filename = result.get(
            "heatmap_file"
        )


        heatmap_path = result.get(
            "heatmap_path"
        )


        # -------------------------------------------------
        # Try alternate result keys
        # -------------------------------------------------

        if not heatmap_filename:

            heatmap_filename = result.get(
                "heatmap_filename"
            )


        if not heatmap_path:

            heatmap_path = result.get(
                "heatmap_output_path"
            )


        # -------------------------------------------------
        # If PersonTracker returned only a heatmap URL
        # -------------------------------------------------

        if not heatmap_path:

            heatmap_url_from_tracker = result.get(
                "heatmap"
            )

            if heatmap_url_from_tracker:

                possible_filename = (
                    os.path.basename(
                        heatmap_url_from_tracker
                    )
                )

                possible_path = os.path.join(
                    HEATMAP_FOLDER,
                    possible_filename
                )

                if os.path.exists(
                    possible_path
                ):

                    heatmap_filename = (
                        possible_filename
                    )

                    heatmap_path = (
                        possible_path
                    )


        # -------------------------------------------------
        # If filename is available, construct path
        # -------------------------------------------------

        if (
            not heatmap_path
            and heatmap_filename
        ):

            heatmap_path = os.path.join(
                HEATMAP_FOLDER,
                heatmap_filename
            )


        # -------------------------------------------------
        # Final fallback
        # -------------------------------------------------
        #
        # Your tracker output currently shows:
        #
        # ..._heatmap.jpg
        #
        # So construct the expected filename.
        #

        if not heatmap_path:

            video_filename = video.get(
                "filename",
                os.path.basename(video_path)
            )

            video_name = os.path.splitext(
                video_filename
            )[0]


            analysis_id = result.get(
                "analysis_id"
            )


            if analysis_id:

                possible_filename = (
                    f"{video_name}_"
                    f"{analysis_id}_heatmap.jpg"
                )

            else:

                possible_filename = (
                    f"{video_name}_heatmap.jpg"
                )


            possible_path = os.path.join(
                HEATMAP_FOLDER,
                possible_filename
            )


            if os.path.exists(
                possible_path
            ):

                heatmap_filename = (
                    possible_filename
                )

                heatmap_path = (
                    possible_path
                )


        # -------------------------------------------------
        # Verify heatmap
        # -------------------------------------------------

        if not heatmap_path:

            raise Exception(
                "PersonTracker did not return "
                "a heatmap path."
            )


        heatmap_path = os.path.abspath(
            heatmap_path
        )


        if not os.path.exists(
            heatmap_path
        ):

            raise Exception(
                "Heatmap path was returned but "
                "file does not exist: "
                + heatmap_path
            )


        # -------------------------------------------------
        # Normalize filename
        # -------------------------------------------------

        heatmap_filename = os.path.basename(
            heatmap_path
        )


        # -------------------------------------------------
        # Frontend URL
        # -------------------------------------------------

        heatmap_url = (
            "/heatmap-output/"
            + heatmap_filename
        )


        # -------------------------------------------------
        # Add heatmap to result
        # -------------------------------------------------

        result["heatmap"] = (
            heatmap_url
        )

        result["heatmap_file"] = (
            heatmap_filename
        )

        result["heatmap_path"] = (
            heatmap_path
        )


        print(
            "Heatmap generated successfully."
        )

        print(
            "Heatmap path:",
            heatmap_path
        )

        print(
            "Heatmap URL:",
            heatmap_url
        )

        print(
            "========================================\n"
        )


        # =================================================
        # CAMERA INFORMATION
        # =================================================

        camera_id = video.get(
            "camera_id"
        )


        if camera_id:

            result["camera_id"] = (
                camera_id
            )

            result["camera_name"] = (
                video.get(
                    "camera_name"
                )
            )


        # =================================================
        # RECOMMENDATIONS
        # =================================================

        recommendations = generate_recommendations(

            unique_people_tracked=
                result.get(
                    "unique_people_tracked",
                    0
                ),

            average_dwell_time=
                result.get(
                    "average_dwell_time_seconds",
                    0
                ),

            max_dwell_time=
                result.get(
                    "max_dwell_time_seconds",
                    0
                )
        )


        result[
            "recommendations"
        ] = recommendations


        # =================================================
        # TOP-LEVEL BEHAVIOR ANALYTICS
        # =================================================
        #
        # These names now MATCH your
        # behavior_analytics.py
        #
        # =================================================

        result["behavior_summary"] = (
            behavior_analysis.get(
                "behavior_summary",
                {}
            )
        )


        result["shopping_patterns"] = (
            behavior_analysis.get(
                "shopping_patterns",
                {}
            )
        )


        result["consumer_segments"] = (
            behavior_analysis.get(
                "consumer_segments",
                {}
            )
        )


        result["journey_analytics"] = (
            behavior_analysis.get(
                "journey_analytics",
                {}
            )
        )


        result["gaze_summary"] = (
            behavior_analysis.get(
                "gaze_summary",
                {}
            )
        )


        result["product_preferences"] = (
            behavior_analysis.get(
                "product_preferences",
                {}
            )
        )


        result["shelf_zone_analysis"] = (
            behavior_analysis.get(
                "shelf_zone_analysis",
                {}
            )
        )


        result["brand_loyalty"] = (
            behavior_analysis.get(
                "brand_loyalty",
                {}
            )
        )


        # =================================================
        # SAVE RESULT
        # =================================================

        await database.videos.update_one(

            {
                "_id":
                    object_id
            },

            {
                "$set":
                {

                    "processing_status":
                        "Completed",

                    "tracking_result":
                        result,

                    "tracking_video":
                        result.get(
                            "tracking_video"
                        ),

                    "heatmap":
                        heatmap_url,

                    "heatmap_file":
                        heatmap_filename,

                    "recommendations":
                        recommendations,

                    "behavior_analysis":
                        behavior_analysis,

                    "analyzed_at":
                        datetime.utcnow().strftime(
                            "%Y-%m-%d %H:%M:%S"
                        )
                }
            }
        )


        # =================================================
        # UPDATE CAMERA WITH ANALYSIS
        # =================================================

        if camera_id:

            await database.cameras.update_one(

                {
                    "_id":
                        ObjectId(camera_id),

                    "owner":
                        current_user["email"]
                },

                {
                    "$set":
                    {

                        "latest_video_id":
                            video_id,

                        "latest_tracking_video":
                            result.get(
                                "tracking_video"
                            ),

                        "latest_heatmap":
                            heatmap_url,

                        "latest_analysis":
                            result,

                        "last_analyzed_at":
                            datetime.utcnow().strftime(
                                "%Y-%m-%d %H:%M:%S"
                            )
                    }
                }
            )


        # =================================================
        # FINAL RESPONSE
        # =================================================

        return {

            "message":
                "Video analysis completed",

            "video_id":
                video_id,

            "filename":
                video.get(
                    "filename"
                ),

            "processing_status":
                "Completed",

            "camera_id":
                camera_id,

            # -------------------------------------------------
            # ORIGINAL VIDEO
            # -------------------------------------------------

            "video_url":
                "/uploads/"
                + video.get(
                    "filename",
                    ""
                ),

            # -------------------------------------------------
            # ANALYZED VIDEO
            # -------------------------------------------------

            "tracking_video":
                result.get(
                    "tracking_video"
                ),

            # -------------------------------------------------
            # HEATMAP
            # -------------------------------------------------

            "heatmap":
                heatmap_url,

            "heatmap_file":
                heatmap_filename,

            # -------------------------------------------------
            # COMPLETE RESULT
            # -------------------------------------------------

            "result":
                result,

            # -------------------------------------------------
            # BEHAVIOR ANALYTICS
            # -------------------------------------------------

            "behavior_analysis":
                behavior_analysis,

            # -------------------------------------------------
            # RECOMMENDATIONS
            # -------------------------------------------------

            "recommendations":
                recommendations
        }


    except HTTPException:

        raise


    except Exception as e:

        print(
            "\n========== VIDEO ANALYSIS ERROR =========="
        )

        traceback.print_exc()

        print(
            "==========================================\n"
        )


        try:

            await database.videos.update_one(

                {
                    "_id":
                        object_id
                },

                {
                    "$set":
                    {
                        "processing_status":
                            "Failed",

                        "error":
                            str(e)
                    }
                }
            )

        except Exception as db_error:

            print(
                "Could not update video status:",
                str(db_error)
            )


        raise HTTPException(

            status_code=500,

            detail=
                f"Video analysis failed: {str(e)}"
        )


# =========================================================
# 3. GET ALL VIDEOS
# =========================================================

@router.get("/videos")
async def get_all_videos(

    current_user=Depends(
        get_current_user
    )

):

    videos = []


    async for video in database.videos.find(
        {
            "owner":
                current_user["email"]
        }
    ):

        video["_id"] = str(
            video["_id"]
        )


        if video.get("filename"):

            video["video_url"] = (
                "/uploads/"
                + video["filename"]
            )


        videos.append(
            video
        )


    return videos


# =========================================================
# 4. GET VIDEO BY ID
# =========================================================

@router.get("/videos/{video_id}")
async def get_video_by_id(

    video_id: str,

    current_user=Depends(
        get_current_user
    )

):

    try:

        object_id = ObjectId(
            video_id
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid video ID"
        )


    video = await database.videos.find_one(

        {
            "_id":
                object_id,

            "owner":
                current_user["email"]
        }
    )


    if video is None:

        raise HTTPException(
            status_code=404,
            detail="Video not found"
        )


    video["_id"] = str(
        video["_id"]
    )


    if video.get("filename"):

        video["video_url"] = (
            "/uploads/"
            + video["filename"]
        )


    return video


# =========================================================
# 5. GET LATEST CAMERA ANALYSIS
# =========================================================

@router.get("/cameras/{camera_id}/latest-analysis")
async def get_latest_camera_analysis(

    camera_id: str,

    current_user=Depends(
        get_current_user
    )

):

    try:

        camera_object_id = ObjectId(
            camera_id
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid camera ID"
        )


    camera = await database.cameras.find_one(

        {
            "_id":
                camera_object_id,

            "owner":
                current_user["email"]
        }
    )


    if camera is None:

        raise HTTPException(
            status_code=404,
            detail="Camera not found"
        )


    video = await database.videos.find_one(

        {
            "camera_id":
                camera_id,

            "owner":
                current_user["email"],

            "processing_status":
                "Completed"
        },

        sort=[
            (
                "analyzed_at",
                -1
            )
        ]
    )


    if video is None:

        return {

            "camera_id":
                camera_id,

            "message":
                "No analyzed video found for this camera",

            "video_url":
                None,

            "tracking_video":
                None,

            "heatmap":
                None,

            "analysis":
                None,

            "behavior_analysis":
                None,

            "recommendations":
                []
        }


    tracking_result = video.get(
        "tracking_result",
        {}
    )


    return {

        "camera_id":
            camera_id,

        "camera_name":
            camera.get(
                "camera_name"
            ),

        "video_id":
            str(
                video["_id"]
            ),

        "filename":
            video.get(
                "filename"
            ),

        "video_url":
            "/uploads/"
            + video.get(
                "filename",
                ""
            ),

        "tracking_video":
            tracking_result.get(
                "tracking_video"
            ),

        "heatmap":
            video.get(
                "heatmap"
            ),

        "analysis":
            tracking_result,

        "behavior_analysis":
            video.get(
                "behavior_analysis",
                tracking_result.get(
                    "behavior_analysis"
                )
            ),

        "recommendations":
            video.get(
                "recommendations",
                []
            )
    }


# =========================================================
# 6. UPDATE VIDEO
# =========================================================

@router.put("/videos/{video_id}")
async def update_video(

    video_id: str,

    video: VideoUpdate,

    current_user=Depends(
        get_current_user
    )

):

    try:

        object_id = ObjectId(
            video_id
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid video ID"
        )


    result = await database.videos.update_one(

        {
            "_id":
                object_id,

            "owner":
                current_user["email"]
        },

        {
            "$set":
                video.model_dump()
        }
    )


    if result.matched_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Video not found"
        )


    return {

        "message":
            "Video updated successfully"
    }


# =========================================================
# 7. DELETE VIDEO
# =========================================================

@router.delete("/videos/{video_id}")
async def delete_video(

    video_id: str,

    current_user=Depends(
        get_current_user
    )

):

    try:

        object_id = ObjectId(
            video_id
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid video ID"
        )


    video = await database.videos.find_one(

        {
            "_id":
                object_id,

            "owner":
                current_user["email"]
        }
    )


    if video is None:

        raise HTTPException(
            status_code=404,
            detail="Video not found"
        )


    # =====================================================
    # DELETE ORIGINAL VIDEO
    # =====================================================

    stored_path = video.get(
        "file_path"
    )


    if stored_path:

        file_path = get_absolute_video_path(
            stored_path
        )


        if os.path.exists(
            file_path
        ):

            try:

                os.remove(
                    file_path
                )

            except Exception as e:

                print(
                    "Could not delete video file:",
                    str(e)
                )


    # =====================================================
    # DELETE HEATMAP
    # =====================================================

    heatmap_file = video.get(
        "heatmap_file"
    )


    if heatmap_file:

        heatmap_path = os.path.join(
            HEATMAP_FOLDER,
            heatmap_file
        )


        if os.path.exists(
            heatmap_path
        ):

            try:

                os.remove(
                    heatmap_path
                )

            except Exception as e:

                print(
                    "Could not delete heatmap:",
                    str(e)
                )


    # =====================================================
    # DELETE DATABASE RECORD
    # =====================================================

    await database.videos.delete_one(

        {
            "_id":
                object_id
        }
    )


    return {

        "message":
            "Video deleted successfully"
    }