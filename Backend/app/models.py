from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True, nullable=False)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"))
    status = Column(String(50), default="Active")
    store = Column(String(150), default="All Stores")
    role = relationship("Role")

class Store(Base):
    __tablename__ = "stores"
    id = Column(Integer, primary_key=True)
    name = Column(String(150), nullable=False)
    location = Column(String(255))
    cameras = relationship("Camera", back_populates="store_rel")

class Zone(Base):
    __tablename__ = "zones"
    id = Column(Integer, primary_key=True)
    store_id = Column(Integer, ForeignKey("stores.id"))
    zone_name = Column(String(100))

class Shelf(Base):
    __tablename__ = "shelves"
    id = Column(Integer, primary_key=True)
    store_id = Column(Integer, ForeignKey("stores.id"))
    zone_id = Column(Integer, ForeignKey("zones.id"))
    shelf_code = Column(String(50))
    position_x = Column(Float)
    position_y = Column(Float)

class Camera(Base):
    __tablename__ = "cameras"
    id = Column(Integer, primary_key=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=True)
    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=True)
    camera_code = Column(String(50), unique=True)
    name = Column(String(150), nullable=True)
    zone_name = Column(String(100), nullable=True)
    resolution = Column(String(50), default="4K (3840x2160)")
    fps = Column(Integer, default=30)
    ip_address = Column(String(50))
    status = Column(String(20), default="Online")
    store_rel = relationship("Store", back_populates="cameras")

class ProductSKU(Base):
    __tablename__ = "products_sku"
    id = Column(Integer, primary_key=True)
    sku_code = Column(String(50), nullable=True)
    name = Column(String(150), nullable=False)
    store = Column(String(150), default="All Stores")
    category = Column(String(100), default="Packaged Goods")
    shelf_tier = Column(String(100), default="Eye-Level (Golden Zone)")
    attention_score = Column(Float, default=80.0)
    interaction_score = Column(Float, default=70.0)
    pickup_score = Column(Float, default=60.0)
    conversion_score = Column(Float, default=50.0)
    repeat_score = Column(Float, default=50.0)
    final_score = Column(Float, default=70.0)
    badge = Column(String(50), default="Steady Performer")

class Campaign(Base):
    __tablename__ = "campaigns"
    id = Column(Integer, primary_key=True)
    name = Column(String(150), nullable=False)
    type = Column(String(50), default="Campaign")
    store = Column(String(150), default="All Stores")
    status = Column(String(50), default="Live")
    budget = Column(Float, default=0.0)
    spend = Column(Float, default=0.0)
    reach = Column(String(50), default="0")
    roi = Column(String(50), default="1.0x")
    discount_pct = Column(Float, default=0.0)
    start_date = Column(String(50), nullable=True)
    end_date = Column(String(50), nullable=True)

class RestockTask(Base):
    __tablename__ = "restock_tasks"
    id = Column(Integer, primary_key=True)
    task_code = Column(String(50), unique=True)
    store = Column(String(150), default="All Stores")
    shelf_location = Column(String(150), nullable=False)
    shelf_tier = Column(String(100), default="Eye-Level (Golden Zone)")
    missing_units = Column(Integer, default=2)
    priority = Column(String(50), default="CRITICAL")
    status = Column(String(50), default="Pending")