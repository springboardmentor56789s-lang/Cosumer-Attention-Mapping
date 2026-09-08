"""
backend/app/routers/restock_tasks.py
Database CRUD Router for Shelf Out-of-Stock (OOS) Restock Tasks
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from ..database import get_db
from ..models import RestockTask

router = APIRouter(prefix="/restock-tasks", tags=["OOS Restock Tasks"])

class RestockTaskCreate(BaseModel):
    task_code: Optional[str] = None
    store: Optional[str] = "All Stores"
    shelf_location: str
    shelf_tier: Optional[str] = "Eye-Level Golden Zone"
    missing_units: Optional[int] = 2
    priority: Optional[str] = "CRITICAL"
    status: Optional[str] = "Pending"

class RestockTaskUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None

class RestockTaskResponse(BaseModel):
    id: int
    task_code: str
    store: str
    shelf_location: str
    shelf_tier: str
    missing_units: int
    priority: str
    status: str

    class Config:
        from_attributes = True

@router.get("", response_model=List[RestockTaskResponse])
def get_restock_tasks(store: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(RestockTask)
    if store and store != "All Stores":
        query = query.filter(RestockTask.store == store)
    return query.order_by(RestockTask.id.asc()).all()

@router.post("", response_model=RestockTaskResponse)
def create_restock_task(payload: RestockTaskCreate, db: Session = Depends(get_db)):
    count = db.query(RestockTask).count() + 1
    task_code = payload.task_code or f"OOS-{count:02d}"
    task = RestockTask(
        task_code=task_code,
        store=payload.store or "All Stores",
        shelf_location=payload.shelf_location,
        shelf_tier=payload.shelf_tier or "Eye-Level Golden Zone",
        missing_units=payload.missing_units or 2,
        priority=payload.priority or "CRITICAL",
        status=payload.status or "Pending"
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@router.patch("/{task_id}", response_model=RestockTaskResponse)
def update_task_status(task_id: int, payload: RestockTaskUpdate, db: Session = Depends(get_db)):
    task = db.query(RestockTask).filter(RestockTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Restock task not found")
    if payload.status:
        task.status = payload.status
    if payload.priority:
        task.priority = payload.priority
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}")
def delete_restock_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(RestockTask).filter(RestockTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Restock task not found")
    db.delete(task)
    db.commit()
    return {"message": f"Task {task.task_code} removed"}