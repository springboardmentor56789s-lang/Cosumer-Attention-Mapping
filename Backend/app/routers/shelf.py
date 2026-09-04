"""
backend/app/routers/shelf.py
Retail Shelf Planogram & Product Detection Router
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from ..services.shelf_analyzer import analyze_shelf_image

router = APIRouter(prefix="/api/shelf")

@router.post("/audit-image")
async def audit_shelf_image(file: UploadFile = File(...)):
    """
    Upload a shelf photo to detect products, Out-of-Stock gaps,
    shelf tiers (Golden Zone), and share-of-shelf percentages.
    """
    try:
        image_bytes = await file.read()
        if not image_bytes:
            raise HTTPException(status_code=400, detail="Empty image uploaded.")
            
        result = analyze_shelf_image(image_bytes, filename=file.filename)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Shelf audit failed: {str(e)}")
