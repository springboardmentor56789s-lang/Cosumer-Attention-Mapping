from fastapi import APIRouter, HTTPException
from datetime import datetime
from bson import ObjectId

from app.database import database


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


# =========================================================
# CREATE NOTIFICATION
# =========================================================

@router.post("/")
async def create_notification(notification: dict):

    notification["created_at"] = datetime.utcnow()

    notification["is_read"] = False

    result = await database.notifications.insert_one(
        notification
    )

    return {
        "message": "Notification created successfully",
        "notification_id": str(result.inserted_id)
    }


# =========================================================
# GET ALL NOTIFICATIONS
# =========================================================

@router.get("/")
async def get_notifications():

    notifications = []

    cursor = database.notifications.find().sort(
        "created_at",
        -1
    )

    async for notification in cursor:

        notification["_id"] = str(
            notification["_id"]
        )

        notifications.append(
            notification
        )

    return notifications


# =========================================================
# GET UNREAD NOTIFICATION COUNT
# =========================================================

@router.get("/unread/count")
async def get_unread_count():

    count = await database.notifications.count_documents(
        {
            "is_read": False
        }
    )

    return {
        "unread_count": count
    }


# =========================================================
# MARK NOTIFICATION AS READ
# =========================================================

@router.put("/{notification_id}/read")
async def mark_notification_as_read(
    notification_id: str
):

    try:

        result = await database.notifications.update_one(
            {
                "_id": ObjectId(notification_id)
            },
            {
                "$set": {
                    "is_read": True
                }
            }
        )

        if result.matched_count == 0:

            raise HTTPException(
                status_code=404,
                detail="Notification not found"
            )

        return {
            "message": "Notification marked as read"
        }

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid notification ID"
        )


# =========================================================
# MARK ALL AS READ
# =========================================================

@router.put("/read/all")
async def mark_all_as_read():

    await database.notifications.update_many(
        {
            "is_read": False
        },
        {
            "$set": {
                "is_read": True
            }
        }
    )

    return {
        "message": "All notifications marked as read"
    }


# =========================================================
# DELETE NOTIFICATION
# =========================================================

@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: str
):

    try:

        result = await database.notifications.delete_one(
            {
                "_id": ObjectId(notification_id)
            }
        )

        if result.deleted_count == 0:

            raise HTTPException(
                status_code=404,
                detail="Notification not found"
            )

        return {
            "message": "Notification deleted successfully"
        }

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid notification ID"
        )


# =========================================================
# CREATE HIGH TRAFFIC ALERT
# =========================================================

@router.post("/alerts/high-traffic")
async def create_high_traffic_alert(
    shopper_count: int,
    store_id: str = "default"
):

    if shopper_count < 10:

        return {
            "alert_created": False,
            "message": "Traffic level is normal"
        }

    notification = {
        "type": "traffic_alert",
        "title": "High Traffic Detected",
        "message": f"{shopper_count} shoppers detected. Traffic is higher than normal.",
        "severity": "high",
        "store_id": store_id,
        "is_read": False,
        "created_at": datetime.utcnow()
    }

    result = await database.notifications.insert_one(
        notification
    )

    return {
        "alert_created": True,
        "notification_id": str(result.inserted_id),
        "message": "High traffic alert created"
    }


# =========================================================
# CREATE LOW ATTENTION ALERT
# =========================================================

@router.post("/alerts/low-attention")
async def create_low_attention_alert(
    attention_score: float,
    shelf_id: str = "default"
):

    if attention_score >= 40:

        return {
            "alert_created": False,
            "message": "Attention level is normal"
        }

    notification = {
        "type": "low_attention_alert",
        "title": "Low Shelf Attention",
        "message": f"Attention score is {attention_score}%. Consider reviewing shelf placement.",
        "severity": "medium",
        "shelf_id": shelf_id,
        "attention_score": attention_score,
        "is_read": False,
        "created_at": datetime.utcnow()
    }

    result = await database.notifications.insert_one(
        notification
    )

    return {
        "alert_created": True,
        "notification_id": str(result.inserted_id),
        "message": "Low attention alert created"
    }


# =========================================================
# CREATE CAMERA HEALTH ALERT
# =========================================================

@router.post("/alerts/camera-health")
async def create_camera_health_alert(
    camera_id: str,
    status: str
):

    if status.lower() == "online":

        return {
            "alert_created": False,
            "message": "Camera is working normally"
        }

    notification = {
        "type": "camera_alert",
        "title": "Camera Health Alert",
        "message": f"Camera {camera_id} status is {status}. Please check the camera.",
        "severity": "high",
        "camera_id": camera_id,
        "is_read": False,
        "created_at": datetime.utcnow()
    }

    result = await database.notifications.insert_one(
        notification
    )

    return {
        "alert_created": True,
        "notification_id": str(result.inserted_id),
        "message": "Camera health alert created"
    }