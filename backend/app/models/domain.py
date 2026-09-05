from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="Store Manager") # Admin, Store Manager, Retail Analyst, Marketing Manager
    phone = Column(String, nullable=True)
    is_email_verified = Column(Boolean, default=False)
    is_phone_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class OTPCode(Base):
    __tablename__ = "otp_codes"
    id = Column(Integer, primary_key=True, index=True)
    target = Column(String, index=True, nullable=False) # Email or Phone number
    code = Column(String, nullable=False) # 6-digit OTP
    purpose = Column(String, default="authentication") # login, register, reset
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Store(Base):
    __tablename__ = "stores"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    city = Column(String, nullable=False)
    address = Column(String, nullable=True)
    number_of_shelves = Column(Integer, default=0)
    active_cameras = Column(Integer, default=0)
    visitor_count = Column(Integer, default=0)
    status = Column(String, default="Active") # Active, Maintenance, Offline
    created_at = Column(DateTime, default=datetime.utcnow)

    shelves = relationship("Shelf", back_populates="store", cascade="all, delete-orphan")
    cameras = relationship("Camera", back_populates="store", cascade="all, delete-orphan")

class Shelf(Base):
    __tablename__ = "shelves"
    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    shelf_code = Column(String, nullable=False)
    category = Column(String, nullable=False)
    product_count = Column(Integer, default=0)
    attention_score = Column(Float, default=0.0) # 0 to 100
    occupancy_percentage = Column(Float, default=0.0)
    camera_id = Column(Integer, nullable=True)
    visibility_score = Column(Float, default=85.0)
    shelf_ranking = Column(Integer, default=1)

    store = relationship("Store", back_populates="shelves")
    products = relationship("Product", back_populates="shelf", cascade="all, delete-orphan")

class Camera(Base):
    __tablename__ = "cameras"
    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    name = Column(String, nullable=False)
    location = Column(String, nullable=False) # e.g., Entrance, Aisle 1, Shelf B
    status = Column(String, default="Online") # Online, Offline, Warning
    ip_address = Column(String, nullable=True)
    stream_url = Column(String, nullable=True)
    health_status = Column(String, default="Good") # Good, Degrading, Error
    active_detections_count = Column(Integer, default=0)

    store = relationship("Store", back_populates="cameras")

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    shelf_id = Column(Integer, ForeignKey("shelves.id"), nullable=False)
    name = Column(String, nullable=False)
    brand = Column(String, nullable=False)
    category = Column(String, nullable=False)
    price = Column(Float, default=0.0)
    stock_status = Column(String, default="In Stock") # In Stock, Low Stock, Out of Stock
    recognition_confidence = Column(Float, default=95.0) # percentage from RPC dataset
    views_count = Column(Integer, default=0)
    pickups_count = Column(Integer, default=0)
    purchases_count = Column(Integer, default=0)
    attention_score = Column(Float, default=0.0)

    shelf = relationship("Shelf", back_populates="products")

class CustomerSession(Base):
    __tablename__ = "customer_sessions"
    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    customer_code = Column(String, nullable=False) # e.g. CUST-8832
    entry_time = Column(DateTime, default=datetime.utcnow)
    exit_time = Column(DateTime, nullable=True)
    current_zone = Column(String, default="Aisle 1")
    dwell_time_seconds = Column(Integer, default=0)
    attention_score = Column(Float, default=0.0)
    journey_json = Column(Text, nullable=True) # JSON representation of steps

class SpatialHeatmapPoint(Base):
    __tablename__ = "heatmap_points"
    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    zone_name = Column(String, nullable=False)
    x_coord = Column(Float, nullable=False) # 0 to 100 percentage layout
    y_coord = Column(Float, nullable=False) # 0 to 100 percentage layout
    intensity = Column(Float, default=1.0) # 0.0 to 1.0
    timestamp = Column(DateTime, default=datetime.utcnow)

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, nullable=True)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    type = Column(String, default="info") # info, warning, danger, success
    severity = Column(String, default="medium") # low, medium, high, critical
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Report(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    report_type = Column(String, nullable=False) # Attention, Traffic, Shelf, Product
    date_range = Column(String, nullable=False)
    generated_by = Column(String, default="System")
    file_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Video(Base):
    __tablename__ = "videos"
    id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    upload_date = Column(DateTime, default=datetime.utcnow)
    uploaded_by = Column(String, default="Store Manager")
    status = Column(String, default="Processed") # Uploaded, Processing, Processed
    duration_seconds = Column(Float, default=0.0)

    detections = relationship("Detection", back_populates="video", cascade="all, delete-orphan")

class Detection(Base):
    __tablename__ = "detections"
    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, ForeignKey("videos.id"), nullable=False)
    frame_number = Column(Integer, nullable=False)
    customer_id = Column(String, nullable=False) # e.g. Customer #1
    confidence = Column(Float, nullable=False) # 0.0 to 1.0
    bounding_box = Column(Text, nullable=False) # JSON [x, y, w, h]
    created_at = Column(DateTime, default=datetime.utcnow)

    video = relationship("Video", back_populates="detections")

# Milestone 3 Models
class BehaviorPattern(Base):
    __tablename__ = "behavior_patterns"
    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, ForeignKey("videos.id"), nullable=False)
    pattern_type = Column(String, nullable=False) # High Traffic, High Dwell, High Attention, Repeat Visit, Low Engagement, Congestion
    description = Column(String, nullable=False)
    evidence = Column(Text, nullable=False)
    confidence = Column(Float, default=0.9)
    created_at = Column(DateTime, default=datetime.utcnow)

class HeatmapData(Base):
    __tablename__ = "heatmaps"
    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, ForeignKey("videos.id"), nullable=False)
    zone_id = Column(String, nullable=True)
    metric_type = Column(String, nullable=False) # movement, attention, shelf
    coordinates = Column(Text, nullable=False) # JSON array of {x, y, intensity}
    created_at = Column(DateTime, default=datetime.utcnow)

class ProductScore(Base):
    __tablename__ = "product_scores"
    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, ForeignKey("videos.id"), nullable=False)
    product_id = Column(String, nullable=False)
    product_name = Column(String, nullable=False)
    attention_events = Column(Integer, default=0)
    attention_duration = Column(Float, default=0.0)
    dwell_time = Column(Float, default=0.0)
    repeat_events = Column(Integer, default=0)
    attractiveness_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

class ZoneAnalytic(Base):
    __tablename__ = "zone_analytics"
    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, ForeignKey("videos.id"), nullable=False)
    zone_id = Column(String, nullable=False)
    visitor_count = Column(Integer, default=0)
    dwell_time = Column(Float, default=0.0)
    attention_events = Column(Integer, default=0)
    engagement_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

class Recommendation(Base):
    __tablename__ = "recommendations"
    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, ForeignKey("videos.id"), nullable=False)
    category = Column(String, nullable=False) # Shelf Optimization, Workforce Optimization, Checkout Optimization, Store Layout
    evidence = Column(Text, nullable=False)
    condition = Column(String, nullable=False)
    recommendation = Column(Text, nullable=False)
    confidence = Column(String, default="High") # High, Medium, Low
    status = Column(String, default="Active")
    created_at = Column(DateTime, default=datetime.utcnow)


