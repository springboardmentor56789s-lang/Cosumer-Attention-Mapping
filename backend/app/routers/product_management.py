from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.database import get_db
from app.model import Product

router = APIRouter(
    prefix="/products",
    tags=["Product Management"]
)


# ==============================
# Get All Products
# ==============================
@router.get("/")
def get_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()

    return {
        "status": True,
        "count": len(products),
        "data": products
    }


# ==============================
# Get Product By ID
# ==============================
@router.get("/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):

    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return product


# ==============================
# Add Product
# ==============================
@router.post("/add")
def add_product(
    product_name: str,
    sku: str,
    barcode: str,
    category: str,
    brand: str,
    price: float,
    stock_quantity: int,
    shelf_id: int,
    store_id: int,
    status: str,
    product_image: str,
    description: str,
    db: Session = Depends(get_db)
):

    # SKU already exists
    existing = db.query(Product).filter(
        Product.sku == sku
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="SKU already exists"
        )

    new_product = Product(
        product_name=product_name,
        sku=sku,
        barcode=barcode,
        category=category,
        brand=brand,
        price=price,
        stock_quantity=stock_quantity,
        shelf_id=shelf_id,
        store_id=store_id,
        status=status,
        product_image=product_image,
        description=description
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return {
        "message": "Product Added Successfully",
        "product": new_product
    }


# ==============================
# Update Product
# ==============================
@router.put("/{product_id}")
def update_product(
    product_id: int,
    product_name: str,
    sku: str,
    barcode: str,
    category: str,
    brand: str,
    price: float,
    stock_quantity: int,
    shelf_id: int,
    store_id: int,
    status: str,
    product_image: str,
    description: str,
    db: Session = Depends(get_db)
):

    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    product.product_name = product_name
    product.sku = sku
    product.barcode = barcode
    product.category = category
    product.brand = brand
    product.price = price
    product.stock_quantity = stock_quantity
    product.shelf_id = shelf_id
    product.store_id = store_id
    product.status = status
    product.product_image = product_image
    product.description = description

    db.commit()
    db.refresh(product)

    return {
        "message": "Product Updated Successfully",
        "product": product
    }


# ==============================
# Delete Product
# ==============================
@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db)
):

    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    db.delete(product)
    db.commit()

    return {
        "message": "Product Deleted Successfully"
    }