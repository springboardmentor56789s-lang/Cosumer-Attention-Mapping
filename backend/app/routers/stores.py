from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId

from app.database import database
from app.schemas import (
    StoreCreate,
    StoreUpdate,
    StoreZoneCreate
)
from app.dependencies import get_current_user


router = APIRouter()


# =========================================================
# CREATE STORE
# =========================================================

@router.post("/stores")
async def create_store(
    store: StoreCreate,
    current_user=Depends(get_current_user)
):

    store_data = store.model_dump()

    # Store owner
    store_data["owner"] = current_user["email"]

    # Store management data
    store_data["zones"] = []

    result = await database.stores.insert_one(
        store_data
    )

    return {
        "message": "Store created successfully",
        "id": str(result.inserted_id)
    }


# =========================================================
# GET ALL STORES
# =========================================================

@router.get("/stores")
async def get_all_stores(
    current_user=Depends(get_current_user)
):

    stores = []

    cursor = database.stores.find(
        {
            "owner": current_user["email"]
        }
    )

    async for store in cursor:

        store["_id"] = str(
            store["_id"]
        )

        # Compatibility for old stores
        if "zones" not in store:
            store["zones"] = []

        stores.append(store)

    return stores


# =========================================================
# GET STORE BY ID
# =========================================================

@router.get("/stores/{store_id}")
async def get_store(
    store_id: str,
    current_user=Depends(get_current_user)
):

    try:

        object_id = ObjectId(
            store_id
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid store ID"
        )

    store = await database.stores.find_one(
        {
            "_id": object_id,
            "owner": current_user["email"]
        }
    )

    if store is None:

        raise HTTPException(
            status_code=404,
            detail="Store not found"
        )

    store["_id"] = str(
        store["_id"]
    )

    # Compatibility for old stores
    if "zones" not in store:
        store["zones"] = []

    return store


# =========================================================
# UPDATE STORE
# =========================================================

@router.put("/stores/{store_id}")
async def update_store(
    store_id: str,
    store: StoreUpdate,
    current_user=Depends(get_current_user)
):

    try:

        object_id = ObjectId(
            store_id
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid store ID"
        )

    store_data = store.model_dump()

    result = await database.stores.update_one(

        {
            "_id": object_id,
            "owner": current_user["email"]
        },

        {
            "$set": store_data
        }

    )

    if result.matched_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Store not found"
        )

    return {
        "message": "Store updated successfully"
    }


# =========================================================
# DELETE STORE
# =========================================================

@router.delete("/stores/{store_id}")
async def delete_store(
    store_id: str,
    current_user=Depends(get_current_user)
):

    try:

        object_id = ObjectId(
            store_id
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid store ID"
        )

    result = await database.stores.delete_one(

        {
            "_id": object_id,
            "owner": current_user["email"]
        }

    )

    if result.deleted_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Store not found"
        )

    # Remove cameras belonging to this store
    await database.cameras.delete_many(
        {
            "store_id": store_id,
            "owner": current_user["email"]
        }
    )

    # Remove shelves belonging to this store
    await database.shelves.delete_many(
        {
            "store_id": store_id,
            "owner": current_user["email"]
        }
    )

    # Remove products belonging to this store
    await database.products.delete_many(
        {
            "store_id": store_id,
            "owner": current_user["email"]
        }
    )

    return {
        "message": "Store deleted successfully"
    }


# =========================================================
# ADD ZONE TO STORE
# =========================================================

@router.post("/stores/{store_id}/zones")
async def add_store_zone(
    store_id: str,
    zone: StoreZoneCreate,
    current_user=Depends(get_current_user)
):

    try:

        object_id = ObjectId(
            store_id
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid store ID"
        )

    store = await database.stores.find_one(
        {
            "_id": object_id,
            "owner": current_user["email"]
        }
    )

    if store is None:

        raise HTTPException(
            status_code=404,
            detail="Store not found"
        )

    zones = store.get(
        "zones",
        []
    )

    # Prevent duplicate zone names
    duplicate = any(
        existing_zone.get("zone_name", "").lower()
        == zone.zone_name.strip().lower()
        for existing_zone in zones
    )

    if duplicate:

        raise HTTPException(
            status_code=400,
            detail="A zone with this name already exists"
        )

    zone_data = {
        "zone_id": str(ObjectId()),
        "zone_name": zone.zone_name.strip(),
        "zone_type": zone.zone_type.strip()
    }

    await database.stores.update_one(

        {
            "_id": object_id,
            "owner": current_user["email"]
        },

        {
            "$push": {
                "zones": zone_data
            }
        }

    )

    return {
        "message": "Zone added successfully",
        "zone": zone_data
    }


# =========================================================
# DELETE STORE ZONE
# =========================================================

@router.delete("/stores/{store_id}/zones/{zone_id}")
async def delete_store_zone(
    store_id: str,
    zone_id: str,
    current_user=Depends(get_current_user)
):

    try:

        object_id = ObjectId(
            store_id
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid store ID"
        )

    store = await database.stores.find_one(
        {
            "_id": object_id,
            "owner": current_user["email"]
        }
    )

    if store is None:

        raise HTTPException(
            status_code=404,
            detail="Store not found"
        )

    # Don't allow deleting a zone if cameras
    # are still assigned to it
    camera_count = await database.cameras.count_documents(
        {
            "store_id": store_id,
            "zone_id": zone_id,
            "owner": current_user["email"]
        }
    )

    if camera_count > 0:

        raise HTTPException(
            status_code=400,
            detail=(
                "This zone has cameras assigned. "
                "Remove the camera assignments first."
            )
        )

    result = await database.stores.update_one(

        {
            "_id": object_id,
            "owner": current_user["email"]
        },

        {
            "$pull": {
                "zones": {
                    "zone_id": zone_id
                }
            }
        }

    )

    if result.modified_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Zone not found"
        )

    return {
        "message": "Zone deleted successfully"
    }