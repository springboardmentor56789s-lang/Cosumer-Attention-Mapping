from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId

from app.database import database
from app.schemas import ShelfCreate, ShelfUpdate
from app.dependencies import get_current_user


router = APIRouter()


# =========================================================
# CREATE SHELF
# =========================================================

@router.post("/shelves")
async def create_shelf(
    shelf: ShelfCreate,
    current_user=Depends(get_current_user)
):

    # -----------------------------------------------------
    # Validate Store ID
    # -----------------------------------------------------

    try:
        store_object_id = ObjectId(shelf.store_id)

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid store ID"
        )

    # -----------------------------------------------------
    # Find Store
    # -----------------------------------------------------

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

    # -----------------------------------------------------
    # Find Zone inside Store
    # -----------------------------------------------------

    zones = store.get("zones", [])

    zone = next(
        (
            z for z in zones
            if z.get("zone_id") == shelf.zone_id
        ),
        None
    )

    if zone is None:
        raise HTTPException(
            status_code=404,
            detail="Zone not found in this store"
        )

    # -----------------------------------------------------
    # Create Shelf
    # -----------------------------------------------------

    shelf_data = shelf.model_dump()

    shelf_data["owner"] = current_user["email"]

    result = await database.shelves.insert_one(
        shelf_data
    )

    return {
        "message": "Shelf created successfully",
        "id": str(result.inserted_id)
    }


# =========================================================
# GET ALL SHELVES
# =========================================================

@router.get("/shelves")
async def get_all_shelves(
    current_user=Depends(get_current_user)
):

    shelves = []

    cursor = database.shelves.find(
        {
            "owner": current_user["email"]
        }
    )

    async for shelf in cursor:

        shelf["_id"] = str(
            shelf["_id"]
        )

        shelves.append(shelf)

    return shelves


# =========================================================
# GET SHELVES BY STORE
# =========================================================

@router.get("/stores/{store_id}/shelves")
async def get_store_shelves(
    store_id: str,
    current_user=Depends(get_current_user)
):

    try:
        store_object_id = ObjectId(store_id)

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid store ID"
        )

    # -----------------------------------------------------
    # Check Store
    # -----------------------------------------------------

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

    # -----------------------------------------------------
    # Get Shelves
    # -----------------------------------------------------

    shelves = []

    cursor = database.shelves.find(
        {
            "store_id": store_id,
            "owner": current_user["email"]
        }
    )

    async for shelf in cursor:

        shelf["_id"] = str(
            shelf["_id"]
        )

        shelves.append(shelf)

    return shelves


# =========================================================
# GET SHELF BY ID
# =========================================================

@router.get("/shelves/{shelf_id}")
async def get_shelf(
    shelf_id: str,
    current_user=Depends(get_current_user)
):

    try:
        object_id = ObjectId(shelf_id)

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid shelf ID"
        )

    shelf = await database.shelves.find_one(
        {
            "_id": object_id,
            "owner": current_user["email"]
        }
    )

    if shelf is None:
        raise HTTPException(
            status_code=404,
            detail="Shelf not found"
        )

    shelf["_id"] = str(
        shelf["_id"]
    )

    return shelf


# =========================================================
# UPDATE SHELF
# =========================================================

@router.put("/shelves/{shelf_id}")
async def update_shelf(
    shelf_id: str,
    shelf: ShelfUpdate,
    current_user=Depends(get_current_user)
):

    try:
        object_id = ObjectId(shelf_id)

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid shelf ID"
        )

    # -----------------------------------------------------
    # Find existing shelf
    # -----------------------------------------------------

    existing_shelf = await database.shelves.find_one(
        {
            "_id": object_id,
            "owner": current_user["email"]
        }
    )

    if existing_shelf is None:
        raise HTTPException(
            status_code=404,
            detail="Shelf not found"
        )

    # -----------------------------------------------------
    # Find Store
    # -----------------------------------------------------

    try:
        store_object_id = ObjectId(
            existing_shelf["store_id"]
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

    # -----------------------------------------------------
    # Check Zone
    # -----------------------------------------------------

    zones = store.get("zones", [])

    zone = next(
        (
            z for z in zones
            if z.get("zone_id") == shelf.zone_id
        ),
        None
    )

    if zone is None:
        raise HTTPException(
            status_code=404,
            detail="Zone not found in this store"
        )

    # -----------------------------------------------------
    # Update Shelf
    # -----------------------------------------------------

    result = await database.shelves.update_one(
        {
            "_id": object_id,
            "owner": current_user["email"]
        },
        {
            "$set": shelf.model_dump()
        }
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Shelf not found"
        )

    return {
        "message": "Shelf updated successfully"
    }


# =========================================================
# DELETE SHELF
# =========================================================

@router.delete("/shelves/{shelf_id}")
async def delete_shelf(
    shelf_id: str,
    current_user=Depends(get_current_user)
):

    try:
        object_id = ObjectId(shelf_id)

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid shelf ID"
        )

    # -----------------------------------------------------
    # Check Shelf
    # -----------------------------------------------------

    shelf = await database.shelves.find_one(
        {
            "_id": object_id,
            "owner": current_user["email"]
        }
    )

    if shelf is None:
        raise HTTPException(
            status_code=404,
            detail="Shelf not found"
        )

    # -----------------------------------------------------
    # Delete Shelf
    # -----------------------------------------------------

    result = await database.shelves.delete_one(
        {
            "_id": object_id,
            "owner": current_user["email"]
        }
    )

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Shelf not found"
        )

    # -----------------------------------------------------
    # Remove Shelf Reference From Products
    # -----------------------------------------------------

    await database.products.update_many(
        {
            "shelf_id": shelf_id,
            "owner": current_user["email"]
        },
        {
            "$unset": {
                "shelf_id": ""
            }
        }
    )

    # -----------------------------------------------------
    # Remove Shelf Reference From Cameras
    # -----------------------------------------------------

    await database.cameras.update_many(
        {
            "shelf_id": shelf_id,
            "owner": current_user["email"]
        },
        {
            "$unset": {
                "shelf_id": ""
            }
        }
    )

    return {
        "message": "Shelf deleted successfully"
    }