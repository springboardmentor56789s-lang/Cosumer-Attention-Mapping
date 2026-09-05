from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models.domain import Product
from app.schemas.schemas import ProductOut, ProductCreate

router = APIRouter()

@router.get("", response_model=List[ProductOut])
def get_products(category: Optional[str] = None, shelf_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Product)
    if category:
        query = query.filter(Product.category == category)
    if shelf_id:
        query = query.filter(Product.shelf_id == shelf_id)
    return query.all()

@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
    return prod

@router.post("", response_model=ProductOut)
def create_product(prod_in: ProductCreate, db: Session = Depends(get_db)):
    prod = Product(**prod_in.model_dump())
    db.add(prod)
    db.commit()
    db.refresh(prod)
    return prod
