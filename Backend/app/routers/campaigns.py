"""
backend/app/routers/campaigns.py
Database CRUD Router for Marketing Campaigns and Promotions
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from ..database import get_db
from ..models import Campaign

router = APIRouter(prefix="/campaigns", tags=["Marketing Campaigns and Promotions"])

class CampaignCreate(BaseModel):
    name: str
    type: Optional[str] = "Campaign"
    store: Optional[str] = "All Stores"
    status: Optional[str] = "Scheduled"
    budget: Optional[float] = 0.0
    spend: Optional[float] = 0.0
    reach: Optional[str] = "—"
    roi: Optional[str] = "—"
    discount_pct: Optional[float] = 0.0
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class CampaignResponse(BaseModel):
    id: int
    name: str
    type: str
    store: str
    status: str
    budget: float
    spend: float
    reach: str
    roi: str
    discount_pct: float
    start_date: Optional[str] = None
    end_date: Optional[str] = None

    class Config:
        from_attributes = True

@router.get("", response_model=List[CampaignResponse])
def get_campaigns(store: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Campaign)
    if store and store != "All Stores":
        query = query.filter(Campaign.store == store)
    return query.order_by(Campaign.id.asc()).all()

@router.post("", response_model=CampaignResponse)
def create_campaign(payload: CampaignCreate, db: Session = Depends(get_db)):
    campaign = Campaign(
        name=payload.name,
        type=payload.type or "Campaign",
        store=payload.store or "All Stores",
        status=payload.status or "Scheduled",
        budget=payload.budget or 0.0,
        spend=payload.spend or 0.0,
        reach=payload.reach or "—",
        roi=payload.roi or "—",
        discount_pct=payload.discount_pct or 0.0,
        start_date=payload.start_date,
        end_date=payload.end_date
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    return campaign

@router.put("/{campaign_id}", response_model=CampaignResponse)
def update_campaign(campaign_id: int, payload: CampaignCreate, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    campaign.name = payload.name
    campaign.type = payload.type or campaign.type
    campaign.store = payload.store or campaign.store
    campaign.status = payload.status or campaign.status
    campaign.budget = payload.budget if payload.budget is not None else campaign.budget
    campaign.spend = payload.spend if payload.spend is not None else campaign.spend
    campaign.reach = payload.reach or campaign.reach
    campaign.roi = payload.roi or campaign.roi
    campaign.discount_pct = payload.discount_pct if payload.discount_pct is not None else campaign.discount_pct
    campaign.start_date = payload.start_date or campaign.start_date
    campaign.end_date = payload.end_date or campaign.end_date
    
    db.commit()
    db.refresh(campaign)
    return campaign

@router.delete("/{campaign_id}")
def delete_campaign(campaign_id: int, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    db.delete(campaign)
    db.commit()
    return {"message": f"Campaign {campaign.name} deleted successfully"}