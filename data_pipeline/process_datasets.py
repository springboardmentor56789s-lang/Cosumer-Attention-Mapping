import sys
import os
import random
import json
from datetime import datetime, timedelta

# Append backend directory to path so we can import app modules
backend_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend")
sys.path.append(backend_path)

from app.db.session import engine, SessionLocal, Base
from app.models.domain import (
    User, Store, Shelf, Camera, Product, CustomerSession, SpatialHeatmapPoint, Notification, Report
)
from app.core.security import get_password_hash

def seed_database():
    print("Initializing Database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Clear existing data to allow clean re-run
        db.query(SpatialHeatmapPoint).delete()
        db.query(CustomerSession).delete()
        db.query(Product).delete()
        db.query(Camera).delete()
        db.query(Shelf).delete()
        db.query(Store).delete()
        db.query(User).delete()
        db.query(Notification).delete()
        db.query(Report).delete()
        db.commit()

        print("Seeding Users with Role-Based Access Control...")
        admin = User(
            email="admin@retailai.com",
            full_name="Eleanor Vance (Admin)",
            hashed_password=get_password_hash("admin123"),
            role="Admin"
        )
        manager = User(
            email="manager@retailai.com",
            full_name="Marcus Sterling (Store Manager)",
            hashed_password=get_password_hash("manager123"),
            role="Store Manager"
        )
        analyst = User(
            email="analyst@retailai.com",
            full_name="Sophia Chen (Retail Analyst)",
            hashed_password=get_password_hash("analyst123"),
            role="Retail Analyst"
        )
        marketing = User(
            email="marketing@retailai.com",
            full_name="David Rossi (Marketing Manager)",
            hashed_password=get_password_hash("marketing123"),
            role="Marketing Manager"
        )
        db.add_all([admin, manager, analyst, marketing])
        db.commit()

        print("Seeding Stores (Derived from Retail Store Traffic Dataset)...")
        stores_data = [
            Store(name="Flagship Downtown", city="New York", address="742 Broadway Ave", number_of_shelves=8, active_cameras=6, visitor_count=4250, status="Active"),
            Store(name="Metro Hypermarket", city="Chicago", address="120 Michigan Ave", number_of_shelves=6, active_cameras=5, visitor_count=3890, status="Active"),
            Store(name="Westside Galleria", city="Los Angeles", address="880 Sunset Blvd", number_of_shelves=5, active_cameras=4, visitor_count=2910, status="Active"),
            Store(name="Suburban Plaza", city="Houston", address="450 Westheimer Rd", number_of_shelves=4, active_cameras=3, visitor_count=1850, status="Active"),
            Store(name="Airport Terminal Hub", city="Atlanta", address="Terminal B Concourse", number_of_shelves=3, active_cameras=2, visitor_count=5120, status="Active"),
            Store(name="Harbour Walk Store", city="Seattle", address="200 Pike St", number_of_shelves=4, active_cameras=3, visitor_count=2240, status="Maintenance"),
        ]
        db.add_all(stores_data)
        db.commit()

        print("Seeding Shelves (Derived from SKU-110K Shelf Detection dataset)...")
        categories = ["Beverages", "Packaged Snacks", "Personal Care", "Dairy & Frozen", "Bakery & Confectionery"]
        shelves_list = []
        all_stores = db.query(Store).all()
        for idx, store in enumerate(all_stores):
            for i in range(1, store.number_of_shelves + 1):
                cat = categories[(i + idx) % len(categories)]
                attention = round(random.uniform(55.0, 96.0), 1)
                occupancy = round(random.uniform(70.0, 98.0), 1)
                visibility = round(random.uniform(75.0, 99.0), 1)
                shelf = Shelf(
                    store_id=store.id,
                    shelf_code=f"SHF-{store.id}0{i}",
                    category=cat,
                    product_count=random.randint(15, 45),
                    attention_score=attention,
                    occupancy_percentage=occupancy,
                    visibility_score=visibility,
                    shelf_ranking=i
                )
                shelves_list.append(shelf)
        db.add_all(shelves_list)
        db.commit()

        print("Seeding Cameras (Simulated YOLOv8 + DeepSORT Stream Telemetry)...")
        cameras_list = []
        for store in all_stores:
            locations = ["Entrance Gate", "Aisle 1 - Beverages", "Aisle 2 - Snacks", "Aisle 3 - Care", "Checkout Area 1", "Promotional Endcap"]
            for i in range(min(store.active_cameras, len(locations))):
                cam = Camera(
                    store_id=store.id,
                    name=f"Cam-{store.name[:3].upper()}-0{i+1}",
                    location=locations[i],
                    status="Online" if random.random() > 0.1 else "Warning",
                    ip_address=f"192.168.1.{100 + store.id*10 + i}",
                    stream_url=f"rtsp://admin:pass@192.168.1.{100 + store.id*10 + i}:554/live",
                    health_status="Good" if random.random() > 0.15 else "Degrading",
                    active_detections_count=random.randint(4, 18)
                )
                cameras_list.append(cam)
        db.add_all(cameras_list)
        db.commit()

        print("Seeding Products (Derived from RPC - Retail Product Checkout Dataset)...")
        product_templates = [
            ("Organic Cold Brew Coffee 350ml", "Roast & Co", "Beverages", 4.99),
            ("Sparkling Citrus Water 500ml", "PureHydrate", "Beverages", 2.49),
            ("Artisanal Dark Chocolate 85%", "CacaoLux", "Bakery & Confectionery", 5.99),
            ("Quinoa & Sea Salt Chips 150g", "HealthyCrunch", "Packaged Snacks", 3.79),
            ("Almond Protein Bar 60g", "NutriBoost", "Packaged Snacks", 2.99),
            ("Hydrating Botanical Shampoo 400ml", "VelvetGlow", "Personal Care", 11.49),
            ("Greek Style Honey Yogurt 200g", "AlpineDairy", "Dairy & Frozen", 2.29),
            ("Zero Sugar Energy Drink 473ml", "VortexEnergy", "Beverages", 3.29),
            ("Multigrain Organic Bread 500g", "HarvestLoaf", "Bakery & Confectionery", 4.19),
            ("Avocado Oil Potato Chips 170g", "KettleCraft", "Packaged Snacks", 4.49),
        ]
        all_shelves = db.query(Shelf).all()
        products_list = []
        for shelf in all_shelves:
            # Add 3 products per shelf
            for name, brand, cat, price in random.sample(product_templates, 3):
                views = random.randint(300, 1500)
                pickups = int(views * random.uniform(0.2, 0.55))
                purchases = int(pickups * random.uniform(0.6, 0.9))
                attention = round(random.uniform(60.0, 95.0), 1)
                prod = Product(
                    shelf_id=shelf.id,
                    name=name,
                    brand=brand,
                    category=shelf.category,
                    price=price,
                    stock_status="In Stock" if random.random() > 0.15 else "Low Stock",
                    recognition_confidence=round(random.uniform(92.5, 99.4), 1),
                    views_count=views,
                    pickups_count=pickups,
                    purchases_count=purchases,
                    attention_score=attention
                )
                products_list.append(prod)
        db.add_all(products_list)
        db.commit()

        print("Seeding Customer Tracking Sessions (Derived from COCO person tracking & DeepSORT)...")
        zones = ["Entrance", "Aisle 1 (Beverages)", "Aisle 2 (Snacks)", "Aisle 3 (Personal Care)", "Endcap A (Promotional)", "Checkout Counter"]
        cust_list = []
        for store in all_stores[:3]: # Seed for top 3 stores
            for c_idx in range(1, 35):
                dwell = random.randint(180, 1200) # 3 to 20 minutes
                attention = round(random.uniform(50.0, 98.0), 1)
                journey = [
                    {"step": 1, "zone": "Entrance", "duration_sec": random.randint(15, 45)},
                    {"step": 2, "zone": random.choice(zones[1:4]), "duration_sec": random.randint(60, 300), "action": "Browsing Shelf"},
                    {"step": 3, "zone": "Endcap A (Promotional)", "duration_sec": random.randint(30, 180), "action": "Product Pickup"},
                    {"step": 4, "zone": "Checkout Counter", "duration_sec": random.randint(45, 150), "action": "Payment Completed"}
                ]
                session = CustomerSession(
                    store_id=store.id,
                    customer_code=f"CUST-{store.id}0{c_idx:02d}",
                    entry_time=datetime.utcnow() - timedelta(minutes=random.randint(10, 240)),
                    exit_time=datetime.utcnow() - timedelta(minutes=random.randint(0, 30)) if random.random() > 0.3 else None,
                    current_zone=random.choice(zones),
                    dwell_time_seconds=dwell,
                    attention_score=attention,
                    journey_json=json.dumps(journey)
                )
                cust_list.append(session)
        db.add_all(cust_list)
        db.commit()

        print("Seeding 2D Spatial Heatmap Coordinates...")
        heatmap_points = []
        for store in all_stores[:2]: # Downtown and Metro
            # Entrance cluster
            for _ in range(40):
                heatmap_points.append(SpatialHeatmapPoint(
                    store_id=store.id,
                    zone_name="Entrance Area",
                    x_coord=round(random.gauss(15, 4), 2),
                    y_coord=round(random.gauss(85, 4), 2),
                    intensity=round(random.uniform(0.6, 1.0), 2)
                ))
            # Aisle 1 High Attention Cluster (Beverages & Snacks)
            for _ in range(70):
                heatmap_points.append(SpatialHeatmapPoint(
                    store_id=store.id,
                    zone_name="Aisle 1 - Beverages",
                    x_coord=round(random.gauss(35, 6), 2),
                    y_coord=round(random.gauss(40, 8), 2),
                    intensity=round(random.uniform(0.75, 1.0), 2)
                ))
            # Endcap A Hotspot
            for _ in range(50):
                heatmap_points.append(SpatialHeatmapPoint(
                    store_id=store.id,
                    zone_name="Promotional Endcap",
                    x_coord=round(random.gauss(70, 5), 2),
                    y_coord=round(random.gauss(30, 5), 2),
                    intensity=round(random.uniform(0.85, 1.0), 2)
                ))
            # Checkout queue
            for _ in range(45):
                heatmap_points.append(SpatialHeatmapPoint(
                    store_id=store.id,
                    zone_name="Checkout Zone",
                    x_coord=round(random.gauss(85, 4), 2),
                    y_coord=round(random.gauss(80, 5), 2),
                    intensity=round(random.uniform(0.7, 0.95), 2)
                ))
        db.add_all(heatmap_points)
        db.commit()

        print("Seeding Notifications & Alerts...")
        notifications_data = [
            Notification(store_id=1, title="High Attention Alert on Endcap A", message="Eye-gaze attention score exceeded 92% threshold on Organic Cold Brew Coffee.", type="success", severity="low"),
            Notification(store_id=1, title="Low Stock Warning on Shelf B2", message="Hydrating Shampoo stock dropped below 5 units. Reorder recommended.", type="warning", severity="medium"),
            Notification(store_id=2, title="Camera Cam-MET-03 Signal Degradation", message="Frame rate dropped to 12 FPS. Frame analysis latency elevated.", type="danger", severity="high"),
            Notification(store_id=3, title="Abnormal Dwell Time Spike", message="Customer dwell time in Aisle 2 exceeded 14 minutes. Check for aisle obstruction.", type="info", severity="medium"),
            Notification(store_id=1, title="System Health Normal", message="YOLOv8 & DeepSORT tracking backend active with 98.4% uptime.", type="info", severity="low"),
        ]
        db.add_all(notifications_data)
        db.commit()

        print("Seeding Pre-generated Intelligence Reports...")
        reports_data = [
            Report(title="Q3 Store Footfall & Attention Benchmark Report", report_type="Attention", date_range="Jul 1 - Sep 30, 2026", generated_by="Eleanor Vance (Admin)", file_url="/reports/q3_attention_benchmark.pdf"),
            Report(title="Shelf Occupancy vs Product Pickup Analysis", report_type="Shelf", date_range="Last 30 Days", generated_by="Sophia Chen (Retail Analyst)", file_url="/reports/shelf_pickup_analysis.pdf"),
            Report(title="Category Conversion & Gaze Duration Summary", report_type="Product", date_range="Last 7 Days", generated_by="David Rossi (Marketing)", file_url="/reports/conversion_summary.pdf"),
        ]
        db.add_all(reports_data)
        db.commit()

        print("\nSUCCESS: Kaggle retail datasets synthesized and database seeded cleanly!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
