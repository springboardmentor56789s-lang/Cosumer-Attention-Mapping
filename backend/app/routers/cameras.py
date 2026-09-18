from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId

from app.database import database
from app.schemas import CameraCreate, CameraUpdate
from app.dependencies import get_current_user


router = APIRouter()


# =========================================================
# CREATE CAMERA
# =========================================================

@router.post("/cameras")
async def create_camera(
    camera: CameraCreate,
    current_user=Depends(get_current_user)
):

    camera_data = camera.model_dump()

    # Owner
    camera_data["owner"] = current_user["email"]

    # -----------------------------------------------------
    # VALIDATE STORE
    # -----------------------------------------------------

    if camera_data.get("store_id"):

        try:
            store_object_id = ObjectId(
                camera_data["store_id"]
            )

        except Exception:
            raise HTTPException(
                status_code=400,
                detail="Invalid store ID"
            )

        store = await database.stores.find_one(
            {
                "_id": store_object_id,
                "owner": current_user["email"]
            }
        )

        if store is None:
            raise HTTPException(
                status_code=404,
                detail="Store not found"
            )

        # -------------------------------------------------
        # VALIDATE ZONE
        # -------------------------------------------------

        if camera_data.get("zone_id"):

            zones = store.get(
                "zones",
                []
            )

            zone_exists = any(
                zone.get("zone_id")
                == camera_data["zone_id"]
                for zone in zones
            )

            if not zone_exists:
                raise HTTPException(
                    status_code=404,
                    detail="Zone not found in selected store"
                )

    # -----------------------------------------------------
    # CAMERA VIDEO INFORMATION
    # -----------------------------------------------------

    camera_data["uploaded_video_id"] = None
    camera_data["uploaded_video_url"] = None

    # Existing analysis information
    camera_data["latest_video_id"] = None
    camera_data["tracking_video"] = None
    camera_data["heatmap"] = None
    camera_data["analysis"] = None

    # Newer analysis field names used by video.py
    camera_data["latest_tracking_video"] = None
    camera_data["latest_heatmap"] = None
    camera_data["latest_analysis"] = None
    camera_data["last_analyzed_at"] = None

    result = await database.cameras.insert_one(
        camera_data
    )

    return {
        "message": "Camera created successfully",
        "id": str(result.inserted_id)
    }


# =========================================================
# GET ALL CAMERAS
# =========================================================

@router.get("/cameras")
async def get_all_cameras(
    current_user=Depends(get_current_user)
):

    cameras = []

    cursor = database.cameras.find(
        {
            "owner": current_user["email"]
        }
    )

    async for camera in cursor:

        camera["_id"] = str(
            camera["_id"]
        )

        cameras.append(camera)

    return cameras


# =========================================================
# GET CAMERAS FOR STORE
# =========================================================

@router.get("/stores/{store_id}/cameras")
async def get_store_cameras(
    store_id: str,
    current_user=Depends(get_current_user)
):

    try:
        ObjectId(store_id)

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid store ID"
        )

    cameras = []

    cursor = database.cameras.find(
        {
            "store_id": store_id,
            "owner": current_user["email"]
        }
    )

    async for camera in cursor:

        camera["_id"] = str(
            camera["_id"]
        )

        cameras.append(camera)

    return cameras


# =========================================================
# GET CAMERA BY ID
# =========================================================

@router.get("/cameras/{camera_id}")
async def get_camera(
    camera_id: str,
    current_user=Depends(get_current_user)
):

    try:

        object_id = ObjectId(
            camera_id
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid camera ID"
        )

    camera = await database.cameras.find_one(
        {
            "_id": object_id,
            "owner": current_user["email"]
        }
    )

    if camera is None:

        raise HTTPException(
            status_code=404,
            detail="Camera not found"
        )

    camera["_id"] = str(
        camera["_id"]
    )

    return camera


# =========================================================
# UPDATE CAMERA
# =========================================================

@router.put("/cameras/{camera_id}")
async def update_camera(
    camera_id: str,
    camera: CameraUpdate,
    current_user=Depends(get_current_user)
):

    try:

        object_id = ObjectId(
            camera_id
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid camera ID"
        )

    camera_data = camera.model_dump()

    # -----------------------------------------------------
    # VALIDATE STORE + ZONE
    # -----------------------------------------------------

    if camera_data.get("store_id"):

        try:

            store_object_id = ObjectId(
                camera_data["store_id"]
            )

        except Exception:

            raise HTTPException(
                status_code=400,
                detail="Invalid store ID"
            )

        store = await database.stores.find_one(
            {
                "_id": store_object_id,
                "owner": current_user["email"]
            }
        )

        if store is None:

            raise HTTPException(
                status_code=404,
                detail="Store not found"
            )

        if camera_data.get("zone_id"):

            zones = store.get(
                "zones",
                []
            )

            zone_exists = any(
                zone.get("zone_id")
                == camera_data["zone_id"]
                for zone in zones
            )

            if not zone_exists:

                raise HTTPException(
                    status_code=404,
                    detail="Zone not found"
                )

    result = await database.cameras.update_one(

        {
            "_id": object_id,
            "owner": current_user["email"]
        },

        {
            "$set": camera_data
        }

    )

    if result.matched_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Camera not found"
        )

    return {
        "message": "Camera updated successfully"
    }


# =========================================================
# DELETE CAMERA
# =========================================================

@router.delete("/cameras/{camera_id}")
async def delete_camera(
    camera_id: str,
    current_user=Depends(get_current_user)
):

    try:

        object_id = ObjectId(
            camera_id
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid camera ID"
        )

    camera = await database.cameras.find_one(
        {
            "_id": object_id,
            "owner": current_user["email"]
        }
    )

    if camera is None:

        raise HTTPException(
            status_code=404,
            detail="Camera not found"
        )

    result = await database.cameras.delete_one(

        {
            "_id": object_id,
            "owner": current_user["email"]
        }

    )

    if result.deleted_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Camera not found"
        )

    # Remove camera reference from videos

    await database.videos.update_many(

        {
            "camera_id": camera_id,
            "owner": current_user["email"]
        },

        {
            "$unset": {
                "camera_id": ""
            }
        }

    )

    return {
        "message": "Camera deleted successfully"
    }


# =========================================================
# SAVE LATEST CAMERA ANALYSIS
# =========================================================

@router.put("/cameras/{camera_id}/analysis")
async def update_camera_analysis(

    camera_id: str,

    analysis_data: dict,

    current_user=Depends(get_current_user)

):

    try:

        object_id = ObjectId(
            camera_id
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid camera ID"
        )

    camera = await database.cameras.find_one(

        {
            "_id": object_id,
            "owner": current_user["email"]
        }

    )

    if camera is None:

        raise HTTPException(
            status_code=404,
            detail="Camera not found"
        )

    update_data = {

        "latest_video_id":
            analysis_data.get(
                "video_id"
            ),

        "tracking_video":
            analysis_data.get(
                "tracking_video"
            ),

        "heatmap":
            analysis_data.get(
                "heatmap"
            ),

        "analysis":
            analysis_data.get(
                "analysis"
            )

    }

    await database.cameras.update_one(

        {
            "_id": object_id,
            "owner": current_user["email"]
        },

        {
            "$set": update_data
        }

    )

    return {
        "message": "Camera analysis updated successfully"
    }