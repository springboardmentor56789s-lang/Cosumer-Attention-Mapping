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
    role = relationship("Role")

class Store(Base):
    __tablename__ = "stores"
    id = Column(Integer, primary_key=True)
    name = Column(String(150), nullable=False)
    location = Column(String(255))

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
    store_id = Column(Integer, ForeignKey("stores.id"))
    zone_id = Column(Integer, ForeignKey("zones.id"))
    camera_code = Column(String(50), unique=True)
    ip_address = Column(String(50))
    status = Column(String(20), default="active")