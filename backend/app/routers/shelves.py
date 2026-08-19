from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.database import get_db
from app.model import Shelf
from app.schema import ShelfCreate, ShelfUpdate, ShelfResponse

router = APIRouter(
    prefix="/api/shelves",
    tags=["Shelves"]
)

# ===========================
# Get All Shelves
# ===========================

@router.get("/", response_model=list[ShelfResponse])
def get_all_shelves(db: Session = Depends(get_db)):
    return db.query(Shelf).all()


# ===========================
# Get Shelf By ID
# ===========================

@router.get("/{shelf_id}", response_model=ShelfResponse)
def get_shelf(shelf_id: int, db: Session = Depends(get_db)):

    shelf = db.query(Shelf).filter(
        Shelf.id == shelf_id
    ).first()

    if shelf is None:
        raise HTTPException(
            status_code=404,
            detail="Shelf not found"
        )

    return shelf


# ===========================
# Create Shelf
# ===========================

@router.post("/", response_model=ShelfResponse)
def create_shelf(
    shelf: ShelfCreate,
    db: Session = Depends(get_db)
):

    existing = db.query(Shelf).filter(
        Shelf.shelf_number == shelf.shelf_number
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Shelf Number already exists."
        )

    new_shelf = Shelf(
        shelf_name=shelf.shelf_name,
        shelf_number=shelf.shelf_number,
        store_id=shelf.store_id,
        category=shelf.category,
        aisle=shelf.aisle,
        capacity=shelf.capacity,
        status=shelf.status
    )

    db.add(new_shelf)
    db.commit()
    db.refresh(new_shelf)

    return new_shelf


# ===========================
# Update Shelf
# ===========================

@router.put("/{shelf_id}", response_model=ShelfResponse)
def update_shelf(
    shelf_id: int,
    shelf: ShelfUpdate,
    db: Session = Depends(get_db)
):

    existing = db.query(Shelf).filter(
        Shelf.id == shelf_id
    ).first()

    if existing is None:
        raise HTTPException(
            status_code=404,
            detail="Shelf not found"
        )

    existing.shelf_name = shelf.shelf_name
    existing.shelf_number = shelf.shelf_number
    existing.store_id = shelf.store_id
    existing.category = shelf.category
    existing.aisle = shelf.aisle
    existing.capacity = shelf.capacity
    existing.status = shelf.status

    db.commit()
    db.refresh(existing)

    return existing


# ===========================
# Delete Shelf
# ===========================

@router.delete("/{shelf_id}")
def delete_shelf(
    shelf_id: int,
    db: Session = Depends(get_db)
):

    shelf = db.query(Shelf).filter(
        Shelf.id == shelf_id
    ).first()

    if shelf is None:
        raise HTTPException(
            status_code=404,
            detail="Shelf not found"
        )

    db.delete(shelf)
    db.commit()

    return {
        "message": "Shelf deleted successfully."
    }