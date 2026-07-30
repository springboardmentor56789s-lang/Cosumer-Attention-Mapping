from .database import SessionLocal
from .models import Store, Zone, Shelf, Camera, Role, User
from .auth import hash_password

from .database import SessionLocal
from .models import Store, Zone, Shelf, Camera

db = SessionLocal()

# Skip seeding if data already exists
if db.query(Store).count() > 0:
    print("Data already seeded — skipping.")
    db.close()
    exit()
# --- Stores ---
store1 = Store(name="Vizag Central Mall Store", location="Visakhapatnam")
store2 = Store(name="Beach Road Outlet", location="Visakhapatnam")
db.add_all([store1, store2])
db.commit()
db.refresh(store1)
db.refresh(store2)

# --- Zones ---
zone1 = Zone(store_id=store1.id, zone_name="Dairy Aisle")
zone2 = Zone(store_id=store1.id, zone_name="Checkout Area")
zone3 = Zone(store_id=store2.id, zone_name="Electronics Section")
db.add_all([zone1, zone2, zone3])
db.commit()
db.refresh(zone1)
db.refresh(zone2)
db.refresh(zone3)

# --- Shelves ---
shelves = [
    Shelf(store_id=store1.id, zone_id=zone1.id, shelf_code="S-101", position_x=1, position_y=2),
    Shelf(store_id=store1.id, zone_id=zone1.id, shelf_code="S-102", position_x=2, position_y=2),
    Shelf(store_id=store2.id, zone_id=zone3.id, shelf_code="S-201", position_x=1, position_y=1),
]
db.add_all(shelves)

# --- Cameras ---
cameras = [
    Camera(store_id=store1.id, zone_id=zone1.id, camera_code="CAM-004", ip_address="192.168.1.13", status="active"),
    Camera(store_id=store1.id, zone_id=zone2.id, camera_code="CAM-005", ip_address="192.168.1.14", status="offline"),
    Camera(store_id=store2.id, zone_id=zone3.id, camera_code="CAM-006", ip_address="192.168.1.15", status="active"),
]
db.add_all(cameras)

db.commit()
db.close()
print("Seed data inserted successfully.")