from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId

from app.database import database
from app.schemas import ProductCreate, ProductUpdate
from app.dependencies import get_current_user


router = APIRouter()


# =========================================================
# CREATE PRODUCT
# =========================================================

@router.post("/products")
async def create_product(
    product: ProductCreate,
    current_user=Depends(get_current_user)
):

    # -----------------------------------------------------
    # Check if store exists
    # -----------------------------------------------------

    try:

        store = await database.stores.find_one(
            {
                "_id": ObjectId(product.store_id),
                "owner": current_user["email"]
            }
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid store ID"
        )

    if store is None:

        raise HTTPException(
            status_code=404,
            detail="Store not found"
        )


    # -----------------------------------------------------
    # Check if shelf exists
    # -----------------------------------------------------

    try:

        shelf = await database.shelves.find_one(
            {
                "_id": ObjectId(product.shelf_id),
                "store_id": product.store_id,
                "owner": current_user["email"]
            }
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid shelf ID"
        )

    if shelf is None:

        raise HTTPException(
            status_code=404,
            detail="Shelf not found in this store"
        )


    # -----------------------------------------------------
    # Save product
    # -----------------------------------------------------

    product_data = product.model_dump()

    product_data["owner"] = current_user["email"]

    result = await database.products.insert_one(
        product_data
    )

    return {
        "message": "Product added successfully",
        "id": str(result.inserted_id)
    }


# =========================================================
# GET ALL PRODUCTS
# =========================================================

@router.get("/products")
async def get_all_products(
    current_user=Depends(get_current_user)
):

    products = []

    async for product in database.products.find(
        {
            "owner": current_user["email"]
        }
    ):

        product["_id"] = str(
            product["_id"]
        )

        products.append(product)

    return products


# =========================================================
# GET PRODUCT BY ID
# =========================================================

@router.get("/products/{product_id}")
async def get_product_by_id(
    product_id: str,
    current_user=Depends(get_current_user)
):

    try:

        product = await database.products.find_one(
            {
                "_id": ObjectId(product_id),
                "owner": current_user["email"]
            }
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid product ID"
        )

    if product is None:

        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    product["_id"] = str(
        product["_id"]
    )

    return product


# =========================================================
# UPDATE PRODUCT
# =========================================================

@router.put("/products/{product_id}")
async def update_product(
    product_id: str,
    product: ProductUpdate,
    current_user=Depends(get_current_user)
):

    # -----------------------------------------------------
    # Validate Product ID
    # -----------------------------------------------------

    try:

        product_object_id = ObjectId(
            product_id
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid product ID"
        )


    # -----------------------------------------------------
    # Find Existing Product
    # -----------------------------------------------------

    existing_product = await database.products.find_one(
        {
            "_id": product_object_id,
            "owner": current_user["email"]
        }
    )

    if existing_product is None:

        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )


    # -----------------------------------------------------
    # Validate Existing Store
    #
    # Store is NOT changed during product editing.
    # -----------------------------------------------------

    existing_store_id = existing_product.get(
        "store_id"
    )

    if not existing_store_id:

        raise HTTPException(
            status_code=400,
            detail="Product does not have a valid store"
        )


    try:

        store = await database.stores.find_one(
            {
                "_id": ObjectId(existing_store_id),
                "owner": current_user["email"]
            }
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid store ID"
        )

    if store is None:

        raise HTTPException(
            status_code=404,
            detail="Store not found"
        )


    # -----------------------------------------------------
    # Validate New Shelf
    #
    # The selected shelf must belong to the same store.
    # -----------------------------------------------------

    try:

        shelf = await database.shelves.find_one(
            {
                "_id": ObjectId(product.shelf_id),
                "store_id": existing_store_id,
                "owner": current_user["email"]
            }
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid shelf ID"
        )

    if shelf is None:

        raise HTTPException(
            status_code=404,
            detail="Shelf not found in this store"
        )


    # -----------------------------------------------------
    # Prepare Update Data
    # -----------------------------------------------------

    update_data = product.model_dump()


    # -----------------------------------------------------
    # Update Product
    # -----------------------------------------------------

    result = await database.products.update_one(
        {
            "_id": product_object_id,
            "owner": current_user["email"]
        },
        {
            "$set": update_data
        }
    )


    if result.matched_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )


    # -----------------------------------------------------
    # Success
    # -----------------------------------------------------

    return {
        "message": "Product updated successfully"
    }


# =========================================================
# DELETE PRODUCT
# =========================================================

@router.delete("/products/{product_id}")
async def delete_product(
    product_id: str,
    current_user=Depends(get_current_user)
):

    # -----------------------------------------------------
    # Validate Product ID
    # -----------------------------------------------------

    try:

        product_object_id = ObjectId(
            product_id
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid product ID"
        )


    # -----------------------------------------------------
    # Delete Product
    # -----------------------------------------------------

    result = await database.products.delete_one(
        {
            "_id": product_object_id,
            "owner": current_user["email"]
        }
    )


    if result.deleted_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )


    # -----------------------------------------------------
    # Success
    # -----------------------------------------------------

    return {
        "message": "Product deleted successfully"
    }