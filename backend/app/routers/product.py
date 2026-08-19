from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import case, func
from sqlalchemy.orm import Session

from app import model
from app.dependencies import require_admin
from app.schemas.product import ProductCreate, ProductListResponse, ProductResponse, ProductUpdate
from database.database import get_db

router = APIRouter(prefix="/api/products", tags=["Products"])


@router.get("", response_model=ProductListResponse)
def list_products(
    db: Session = Depends(get_db),
    admin_user: model.User = Depends(require_admin),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    search: str | None = Query(default=None),
    category: str | None = Query(default=None),
    status_filter: str | None = Query(default=None, alias="status"),
    store_id: int | None = Query(default=None),
    shelf_id: int | None = Query(default=None),
):
    query = db.query(model.Product)

    if search:
        pattern = f"%{search.strip()}%"
        query = query.filter((model.Product.name.ilike(pattern)) | (model.Product.sku.ilike(pattern)))
    if category:
        query = query.filter(model.Product.category == category)
    if status_filter:
        query = query.filter(model.Product.status == status_filter)
    if store_id is not None:
        query = query.filter(model.Product.store_id == store_id)
    if shelf_id is not None:
        query = query.filter(model.Product.shelf_id == shelf_id)

    total = query.count()
    summary = query.with_entities(
        func.coalesce(func.sum(case((model.Product.status == "Active", 1), else_=0)), 0).label("active_products"),
        func.coalesce(func.sum(case(((model.Product.stock_quantity > 0) & (model.Product.stock_quantity <= 10), 1), else_=0)), 0).label("low_stock_products"),
        func.coalesce(func.sum(case((model.Product.stock_quantity == 0, 1), else_=0)), 0).label("out_of_stock_products"),
    ).one()
    rows = query.order_by(model.Product.created_at.desc(), model.Product.id.desc()).offset((page - 1) * page_size).limit(page_size).all()

    items = []
    for row in rows:
        items.append(ProductResponse(
            id=row.id,
            name=row.name,
            sku=row.sku,
            category=row.category,
            barcode=row.barcode,
            brand=row.brand,
            description=row.description,
            price=float(row.price or 0),
            stock_quantity=int(row.stock_quantity or 0),
            status=row.status,
            image_url=row.image_url,
            store_id=row.store_id,
            shelf_id=row.shelf_id,
            store_name=row.store.store_name if row.store else None,
            shelf_name=row.shelf.shelf_name if row.shelf else None,
            created_at=row.created_at,
        ))

    return ProductListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        summary={
            "active_products": int(summary.active_products or 0),
            "low_stock_products": int(summary.low_stock_products or 0),
            "out_of_stock_products": int(summary.out_of_stock_products or 0),
        },
    )


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    payload: ProductCreate,
    db: Session = Depends(get_db),
    admin_user: model.User = Depends(require_admin),
):
    store = db.query(model.Store).filter(model.Store.id == payload.store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")

    shelf = db.query(model.Shelf).filter(model.Shelf.id == payload.shelf_id).first()
    if not shelf:
        raise HTTPException(status_code=404, detail="Shelf not found")
    if shelf.store_id != store.id:
        raise HTTPException(status_code=400, detail="Shelf does not belong to selected store")

    sku_exists = db.query(model.Product).filter(model.Product.sku == payload.sku).first()
    if sku_exists:
        raise HTTPException(status_code=409, detail="SKU already exists")

    product = model.Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)

    return ProductResponse(
        id=product.id,
        name=product.name,
        sku=product.sku,
        category=product.category,
        barcode=product.barcode,
        brand=product.brand,
        description=product.description,
        price=float(product.price or 0),
        stock_quantity=int(product.stock_quantity or 0),
        status=product.status,
        image_url=product.image_url,
        store_id=product.store_id,
        shelf_id=product.shelf_id,
        store_name=product.store.store_name if product.store else None,
        shelf_name=product.shelf.shelf_name if product.shelf else None,
        created_at=product.created_at,
    )


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db), admin_user: model.User = Depends(require_admin)):
    product = db.query(model.Product).filter(model.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return ProductResponse(
        id=product.id,
        name=product.name,
        sku=product.sku,
        category=product.category,
        barcode=product.barcode,
        brand=product.brand,
        description=product.description,
        price=float(product.price or 0),
        stock_quantity=int(product.stock_quantity or 0),
        status=product.status,
        image_url=product.image_url,
        store_id=product.store_id,
        shelf_id=product.shelf_id,
        store_name=product.store.store_name if product.store else None,
        shelf_name=product.shelf.shelf_name if product.shelf else None,
        created_at=product.created_at,
    )


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
    admin_user: model.User = Depends(require_admin),
):
    product = db.query(model.Product).filter(model.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    changes = payload.model_dump(exclude_unset=True)

    if "sku" in changes:
        sku_exists = db.query(model.Product).filter(model.Product.sku == changes["sku"], model.Product.id != product_id).first()
        if sku_exists:
            raise HTTPException(status_code=409, detail="SKU already exists")

    next_store_id = changes.get("store_id", product.store_id)
    next_shelf_id = changes.get("shelf_id", product.shelf_id)

    if next_store_id is not None:
        store = db.query(model.Store).filter(model.Store.id == next_store_id).first()
        if not store:
            raise HTTPException(status_code=404, detail="Store not found")

    if next_shelf_id is not None:
        shelf = db.query(model.Shelf).filter(model.Shelf.id == next_shelf_id).first()
        if not shelf:
            raise HTTPException(status_code=404, detail="Shelf not found")
        if next_store_id is not None and shelf.store_id != next_store_id:
            raise HTTPException(status_code=400, detail="Shelf does not belong to selected store")

    for key, value in changes.items():
        setattr(product, key, value)

    db.commit()
    db.refresh(product)

    return ProductResponse(
        id=product.id,
        name=product.name,
        sku=product.sku,
        category=product.category,
        barcode=product.barcode,
        brand=product.brand,
        description=product.description,
        price=float(product.price or 0),
        stock_quantity=int(product.stock_quantity or 0),
        status=product.status,
        image_url=product.image_url,
        store_id=product.store_id,
        shelf_id=product.shelf_id,
        store_name=product.store.store_name if product.store else None,
        shelf_name=product.shelf.shelf_name if product.shelf else None,
        created_at=product.created_at,
    )


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db), admin_user: model.User = Depends(require_admin)):
    product = db.query(model.Product).filter(model.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
