from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ProductBase(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    sku: str = Field(min_length=2, max_length=60)
    category: Optional[str] = Field(default="General", max_length=100)
    barcode: Optional[str] = Field(default=None, max_length=60)
    brand: Optional[str] = Field(default=None, max_length=80)
    description: Optional[str] = Field(default=None, max_length=1000)
    price: float = Field(default=0, ge=0)
    stock_quantity: int = Field(default=0, ge=0)
    status: str = Field(default="Active", max_length=20)
    image_url: Optional[str] = Field(default=None, max_length=255)

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        allowed = {"Active", "Inactive"}
        normalized = (value or "").strip().title()
        if normalized not in allowed:
            raise ValueError("status must be Active or Inactive")
        return normalized


class ProductCreate(ProductBase):
    store_id: int = Field(gt=0)
    shelf_id: int = Field(gt=0)


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=120)
    sku: Optional[str] = Field(default=None, min_length=2, max_length=60)
    category: Optional[str] = Field(default=None, max_length=100)
    barcode: Optional[str] = Field(default=None, max_length=60)
    brand: Optional[str] = Field(default=None, max_length=80)
    description: Optional[str] = Field(default=None, max_length=1000)
    price: Optional[float] = Field(default=None, ge=0)
    stock_quantity: Optional[int] = Field(default=None, ge=0)
    status: Optional[str] = Field(default=None, max_length=20)
    image_url: Optional[str] = Field(default=None, max_length=255)
    store_id: Optional[int] = Field(default=None, gt=0)
    shelf_id: Optional[int] = Field(default=None, gt=0)

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        allowed = {"Active", "Inactive"}
        normalized = value.strip().title()
        if normalized not in allowed:
            raise ValueError("status must be Active or Inactive")
        return normalized


class ProductResponse(ProductBase):
    id: int
    store_id: Optional[int] = None
    shelf_id: int
    store_name: Optional[str] = None
    shelf_name: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ProductSummary(BaseModel):
    active_products: int = 0
    low_stock_products: int = 0
    out_of_stock_products: int = 0


class ProductListResponse(BaseModel):
    items: list[ProductResponse]
    total: int
    page: int
    page_size: int
    summary: ProductSummary
