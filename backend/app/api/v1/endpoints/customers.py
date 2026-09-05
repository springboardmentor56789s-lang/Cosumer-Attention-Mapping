from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models.domain import CustomerSession
from app.schemas.schemas import CustomerOut

router = APIRouter()

@router.get("", response_model=List[CustomerOut])
def get_customers(store_id: Optional[int] = None, zone: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(CustomerSession)
    if store_id:
        query = query.filter(CustomerSession.store_id == store_id)
    if zone:
        query = query.filter(CustomerSession.current_zone == zone)
    return query.all()

@router.get("/{customer_id}", response_model=CustomerOut)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    cust = db.query(CustomerSession).filter(CustomerSession.id == customer_id).first()
    if not cust:
        raise HTTPException(status_code=404, detail="Customer session not found")
    return cust
