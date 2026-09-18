from pydantic import BaseModel, EmailStr


# =====================================================
# USER SCHEMAS
# =====================================================

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


# =====================================================
# STORE SCHEMAS
# =====================================================

class StoreCreate(BaseModel):
    store_name: str
    location: str
    category: str


class StoreUpdate(BaseModel):
    store_name: str
    location: str
    category: str


class StoreZone(BaseModel):
    zone_id: str
    zone_name: str
    zone_type: str = "General"


class StoreZoneCreate(BaseModel):
    zone_name: str
    zone_type: str = "General"


# =====================================================
# PRODUCT SCHEMAS
# =====================================================

class ProductCreate(BaseModel):
    product_name: str
    category: str
    price: float
    store_id: str
    shelf_id: str


class ProductUpdate(BaseModel):
    product_name: str
    category: str
    price: float
    shelf_id: str


# =====================================================
# SHELF SCHEMAS
# =====================================================

class ShelfCreate(BaseModel):
    shelf_name: str
    section: str
    capacity: int
    store_id: str
    zone_id: str


class ShelfUpdate(BaseModel):
    shelf_name: str
    section: str
    capacity: int
    zone_id: str


# =====================================================
# CAMERA SCHEMAS
# =====================================================

class CameraCreate(BaseModel):
    camera_name: str
    camera_location: str
    camera_type: str
    camera_status: str

    # Kept for compatibility
    shelf_id: str = ""

    # Store management relationship
    store_id: str = ""
    zone_id: str = ""


class CameraUpdate(BaseModel):
    camera_name: str
    camera_location: str
    camera_type: str
    camera_status: str

    # Existing field
    shelf_id: str = ""

    # Store management relationship
    store_id: str = ""
    zone_id: str = ""


# =====================================================
# VIDEO SCHEMAS
# =====================================================

class VideoCreate(BaseModel):
    filename: str
    filepath: str
    owner: str


class VideoUpdate(BaseModel):
    video_name: str
    processing_status: str


class VideoResponse(BaseModel):
    message: str
    filename: str