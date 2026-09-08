"""
backend/app/routers/products.py
Database CRUD Router for Retail Products and Weighted Attractiveness Scoring
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from ..database import get_db
from ..models import ProductSKU

router = APIRouter(prefix="/products", tags=["Products and Attractiveness Scoring"])

class ProductCreate(BaseModel):
    name: str
    store: Optional[str] = "All Stores"
    category: Optional[str] = "Packaged Goods"
    shelf_tier: Optional[str] = "Eye-Level (Golden Zone)"
    attention_score: Optional[float] = 80.0
    interaction_score: Optional[float] = 70.0
    pickup_score: Optional[float] = 60.0
    conversion_score: Optional[float] = 50.0
    repeat_score: Optional[float] = 50.0
    final_score: Optional[float] = 70.0
    badge: Optional[str] = "Steady Performer"

class ProductResponse(BaseModel):
    id: int
    sku_code: Optional[str] = None
    name: str
    store: str
    category: str
    shelf_tier: str
    attention_score: float
    interaction_score: float
    pickup_score: float
    conversion_score: float
    repeat_score: float
    final_score: float
    badge: str

    class Config:
        from_attributes = True

@router.get("", response_model=List[ProductResponse])
def get_products(store: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(ProductSKU)
    if store and store != "All Stores":
        query = query.filter(ProductSKU.store == store)
    return query.order_by(ProductSKU.final_score.desc()).all()

@router.post("", response_model=ProductResponse)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    weighted_score = round(
        (0.35 * (payload.attention_score or 0)) +
        (0.25 * (payload.interaction_score or 0)) +
        (0.20 * (payload.pickup_score or 0)) +
        (0.15 * (payload.conversion_score or 0)) +
        (0.05 * (payload.repeat_score or 0)),
        1
    )
    badge = "Star Product" if weighted_score >= 80 else ("Steady Performer" if weighted_score >= 60 else "Underperforming")

    product = ProductSKU(
        sku_code=f"SKU-{db.query(ProductSKU).count() + 1:03d}",
        name=payload.name,
        store=payload.store or "All Stores",
        category=payload.category or "Packaged Goods",
        shelf_tier=payload.shelf_tier or "Eye-Level (Golden Zone)",
        attention_score=payload.attention_score,
        interaction_score=payload.interaction_score,
        pickup_score=payload.pickup_score,
        conversion_score=payload.conversion_score,
        repeat_score=payload.repeat_score,
        final_score=weighted_score,
        badge=badge
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, payload: ProductCreate, db: Session = Depends(get_db)):
    product = db.query(ProductSKU).filter(ProductSKU.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product.name = payload.name
    product.store = payload.store or product.store
    product.category = payload.category or product.category
    product.shelf_tier = payload.shelf_tier or product.shelf_tier
    product.attention_score = payload.attention_score
    product.interaction_score = payload.interaction_score
    product.pickup_score = payload.pickup_score
    product.conversion_score = payload.conversion_score
    product.repeat_score = payload.repeat_score
    
    product.final_score = round(
        (0.35 * (payload.attention_score or 0)) +
        (0.25 * (payload.interaction_score or 0)) +
        (0.20 * (payload.pickup_score or 0)) +
        (0.15 * (payload.conversion_score or 0)) +
        (0.05 * (payload.repeat_score or 0)),
        1
    )
    product.badge = "Star Product" if product.final_score >= 80 else ("Steady Performer" if product.final_score >= 60 else "Underperforming")
    
    db.commit()
    db.refresh(product)
    return product

@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(ProductSKU).filter(ProductSKU.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    return {"message": f"Product {product.name} deleted successfully"}