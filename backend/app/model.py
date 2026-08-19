import sys
from pathlib import Path
import enum
from sqlalchemy.orm import relationship
from database.database import Base
from sqlalchemy import Column, Integer, String, TIMESTAMP, func, Boolean, DateTime, ForeignKey, Float, Enum, JSON


ROOT_DIR = Path(__file__).resolve().parents[2]
sys.path.append(str(ROOT_DIR))


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    STORE_MANAGER = "store_manager"
    RETAIL_ANALYST = "retail_analyst"
    MARKETING_ANALYST = "marketing_analyst"


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=True)
    role = Column(
        Enum(
            UserRole,
            values_callable=lambda obj: [e.value for e in obj],
        ),
        nullable=False,
    )
    password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    store = relationship("Store", back_populates="users")


class Store(Base):
    __tablename__ = "stores"

    id = Column(Integer, primary_key=True, index=True)
    store_name = Column(String(100), nullable=False)
    location = Column(String(150))
    manager_name = Column(String(100))
    logo_url = Column(String(255), nullable=True)
    theme = Column(String(50), default="default")
    total_shelves = Column(Integer, default=0)
    total_cameras = Column(Integer, default=0)
    is_live_store = Column(Boolean, default=False, nullable=False)
    blueprint_url = Column(String(255), nullable=True)
    blueprint_width = Column(Integer, default=0)
    blueprint_height = Column(Integer, default=0)
    blueprint_config = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    users = relationship("User", back_populates="store")
    shelves = relationship("Shelf", back_populates="store")
    products = relationship("Product", back_populates="store")
    cameras = relationship("Camera", back_populates="store")
    analytics = relationship("Analytics", back_populates="store")
    customer_tracks = relationship("CustomerTrack", back_populates="store")
    heatmaps = relationship("Heatmap", back_populates="store")
    reports = relationship("Report", back_populates="store")
    settings = relationship("Setting", back_populates="store")


class Shelf(Base):
    __tablename__ = "shelves"

    id = Column(Integer, primary_key=True, index=True)
    shelf_name = Column(String(100), nullable=False)
    shelf_number = Column(String(20), unique=True, nullable=False)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    zone_id = Column(Integer, ForeignKey("camera_zones.id"), nullable=True, index=True)
    category = Column(String(100))
    aisle = Column(String(50))
    capacity = Column(Integer, default=0)
    status = Column(String(20), default="Active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    store = relationship("Store", back_populates="shelves")
    products = relationship("Product", back_populates="shelf")
    analytics = relationship("Analytics", back_populates="shelf")
    customer_tracks = relationship("CustomerTrack", back_populates="shelf")
    heatmaps = relationship("Heatmap", back_populates="shelf")
    zone = relationship("CameraZone", back_populates="shelves")
    roi_entry = relationship("CameraShelfROI", back_populates="shelf", uselist=False, cascade="all, delete-orphan")

    @property
    def roi(self):
        """Backward-compatible accessor: manually-drawn ROI lives in camera_shelf_rois."""
        return self.roi_entry.polygon_coordinates if self.roi_entry else None


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    sku = Column(String, unique=True, nullable=False)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=True)
    shelf_id = Column(Integer, ForeignKey("shelves.id"), nullable=False)
    category = Column(String(100), default="General")
    barcode = Column(String(60), nullable=True)
    brand = Column(String(80), nullable=True)
    description = Column(String(1000), nullable=True)
    price = Column(Float, default=0.0)
    stock_quantity = Column(Integer, default=0)
    status = Column(String(20), default="Active")
    image_url = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    store = relationship("Store", back_populates="products")
    shelf = relationship("Shelf", back_populates="products")


class Camera(Base):
    __tablename__ = "cameras"

    id = Column(Integer, primary_key=True, index=True)
    camera_name = Column(String(100))
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    rtsp_url = Column(String)
    location = Column(String(100))
    status = Column(String(20), default="Online")
    camera_type = Column(String(20), default="rtsp")
    fps = Column(Float, default=0.0)
    processing_status = Column(String(30), default="Idle")
    current_detection_status = Column(String(30), default="Idle")
    video_path = Column(String(255), nullable=True)
    blueprint_url = Column(String(255), nullable=True)
    blueprint_width = Column(Integer, default=0)
    blueprint_height = Column(Integer, default=0)
    calibration_points = Column(JSON, default=dict)
    homography_matrix = Column(JSON, default=list)
    blueprint_polygon_zones = Column(JSON, default=list)
    last_active_at = Column(DateTime(timezone=True), server_default=func.now())
    installed_on = Column(DateTime(timezone=True), server_default=func.now())
    store = relationship("Store", back_populates="cameras")
    analytics = relationship("Analytics", back_populates="camera")
    customer_tracks = relationship("CustomerTrack", back_populates="camera")
    heatmaps = relationship("Heatmap", back_populates="camera")
    zones = relationship("CameraZone", back_populates="camera", cascade="all, delete-orphan")


class CameraZone(Base):
    """A named zone belonging to exactly one camera (identity only, no ROI)."""
    __tablename__ = "camera_zones"

    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(Integer, ForeignKey("cameras.id", ondelete="CASCADE"), nullable=False, index=True)
    zone_name = Column(String(100), nullable=False)
    zone_code = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    camera = relationship("Camera", back_populates="zones")
    shelves = relationship("Shelf", back_populates="zone", cascade="all, delete-orphan")
    roi_entry = relationship("CameraZoneROI", back_populates="zone", uselist=False, cascade="all, delete-orphan")

    @property
    def roi(self):
        """Backward-compatible accessor: manually-drawn ROI lives in camera_zone_rois."""
        return self.roi_entry.polygon_coordinates if self.roi_entry else None


class CameraZoneROI(Base):
    """Manually-drawn zone polygon ROI, keyed by camera_id + zone_id."""
    __tablename__ = "camera_zone_rois"

    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(Integer, ForeignKey("cameras.id", ondelete="CASCADE"), nullable=False, index=True)
    zone_id = Column(Integer, ForeignKey("camera_zones.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    polygon_coordinates = Column(JSON, nullable=False)  # {type: rectangle|polygon, points: [{x, y}, ...]}
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    zone = relationship("CameraZone", back_populates="roi_entry")


class CameraShelfROI(Base):
    """Manually-drawn shelf polygon ROI, keyed by camera_id + shelf_id."""
    __tablename__ = "camera_shelf_rois"

    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(Integer, ForeignKey("cameras.id", ondelete="CASCADE"), nullable=False, index=True)
    shelf_id = Column(Integer, ForeignKey("shelves.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    polygon_coordinates = Column(JSON, nullable=False)  # {type: rectangle|polygon, points: [{x, y}, ...]}
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    shelf = relationship("Shelf", back_populates="roi_entry")


class VideoTrajectoryEvent(Base):
    __tablename__ = "video_trajectory_events"

    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(String(255), nullable=False, index=True)
    camera_id = Column(Integer, ForeignKey("cameras.id", ondelete="CASCADE"), nullable=False, index=True)
    frame_number = Column(Integer, nullable=False, default=0, index=True)
    timestamp = Column(Float, nullable=False, default=0.0)
    customer_id = Column(Integer, nullable=False, index=True)
    camera_x = Column(Float, nullable=False, default=0.0)
    camera_y = Column(Float, nullable=False, default=0.0)
    blueprint_x = Column(Float, nullable=False, default=0.0)
    blueprint_y = Column(Float, nullable=False, default=0.0)
    zone_id = Column(Integer, nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Analytics(Base):
    __tablename__ = "analytics"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, nullable=False)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    camera_id = Column(Integer, ForeignKey("cameras.id"), nullable=False)
    shelf_id = Column(Integer, ForeignKey("shelves.id"), nullable=True)
    viewed_product = Column(String(100), nullable=True)
    dwell_time = Column(Float, default=0.0)
    attention_score = Column(Float, default=0.0)
    distance_to_shelf = Column(Float, default=0.0)
    face_direction = Column(String(50), default="forward")
    head_angle = Column(Float, default=0.0)
    looking_at_shelf = Column(Boolean, default=False)
    looking_at_product = Column(Boolean, default=False)
    walking_speed = Column(Float, default=0.0)
    customer_path = Column(String(500), default="")
    visit_time = Column(DateTime(timezone=True), server_default=func.now())

    store = relationship("Store", back_populates="analytics")
    camera = relationship("Camera", back_populates="analytics")
    shelf = relationship("Shelf", back_populates="analytics")


class CustomerTrack(Base):
    __tablename__ = "customer_tracks"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, nullable=False)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    camera_id = Column(Integer, ForeignKey("cameras.id"), nullable=False)
    shelf_id = Column(Integer, ForeignKey("shelves.id"), nullable=True)
    product_viewed = Column(String(100), nullable=True)
    entry_time = Column(DateTime(timezone=True), server_default=func.now())
    exit_time = Column(DateTime(timezone=True), nullable=True)
    dwell_time = Column(Float, default=0.0)
    distance_to_shelf = Column(Float, default=0.0)
    face_direction = Column(String(50), default="forward")
    head_angle = Column(Float, default=0.0)
    looking_at_shelf = Column(Boolean, default=False)
    looking_at_product = Column(Boolean, default=False)
    walking_speed = Column(Float, default=0.0)
    customer_path = Column(String(500), default="")
    attention_score = Column(Float, default=0.0)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    store = relationship("Store", back_populates="customer_tracks")
    camera = relationship("Camera", back_populates="customer_tracks")
    shelf = relationship("Shelf", back_populates="customer_tracks")


class Heatmap(Base):
    __tablename__ = "heatmaps"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    camera_id = Column(Integer, ForeignKey("cameras.id"), nullable=False)
    shelf_id = Column(Integer, ForeignKey("shelves.id"), nullable=True)
    coordinates = Column(JSON, default=dict)
    heatmap_type = Column(String(30), default="movement")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    store = relationship("Store", back_populates="heatmaps")
    camera = relationship("Camera", back_populates="heatmaps")
    shelf = relationship("Shelf", back_populates="heatmaps")


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    # Public identifier for a generated report.  This remains stable even if the
    # internal database primary key implementation changes.
    report_id = Column(String(36), unique=True, index=True, nullable=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=True)
    report_name = Column(String(100), nullable=False)
    report_type = Column(String(50), nullable=False)
    filters = Column(JSON, default=dict)
    file_path = Column(String(255), nullable=True)
    created_by = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    store = relationship("Store", back_populates="reports")


class Setting(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    store_name = Column(String(100), nullable=True)
    logo_url = Column(String(255), nullable=True)
    theme = Column(String(50), default="dark")
    jwt_expiry_minutes = Column(Integer, default=480)
    notification_enabled = Column(Boolean, default=True)
    camera_detection_threshold = Column(Float, default=0.25)
    yolo_confidence = Column(Float, default=0.25)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    store = relationship("Store", back_populates="settings")


class Detection(Base):
    __tablename__ = "detections"

    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(Integer, ForeignKey("cameras.id"), nullable=False)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    shelf_id = Column(Integer, ForeignKey("shelves.id"), nullable=True)
    zone_id = Column(Integer, ForeignKey("camera_zones.id"), nullable=True)
    track_id = Column(Integer, nullable=True)
    detected_class = Column(String(100), nullable=False)
    confidence = Column(Float, nullable=False)
    bbox_x = Column(Integer, nullable=False)
    bbox_y = Column(Integer, nullable=False)
    bbox_w = Column(Integer, nullable=False)
    bbox_h = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    @property
    def class_name(self):
        return self.detected_class

    @property
    def bbox(self):
        return {"x1": self.bbox_x, "y1": self.bbox_y, "x2": self.bbox_x + self.bbox_w, "y2": self.bbox_y + self.bbox_h}
