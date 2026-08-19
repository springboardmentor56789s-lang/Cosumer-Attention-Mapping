"""
Dataset import and seeding module.
Handles loading and importing consumer attention mapping data into the database.
"""

import os
import sys
import csv
import json
from pathlib import Path
from typing import Dict, Any, List

sys.path.append(str(Path(__file__).resolve().parents[2]))

from app.model import (
    Store,
    Camera,
    User,
    Shelf,
    Product,
    Analytics,
    CustomerTrack,
    Heatmap,
    Report,
    Setting,
    Detection,
    UserRole,
)
from database.database import SessionLocal, engine, Base, ensure_schema_compatibility
from sqlalchemy import text


class DatasetImporter:
    """Handle dataset import and database seeding."""

    def __init__(self):
        """Initialize the importer."""
        self.db = SessionLocal()
        self.imported_count = 0
        self.error_count = 0

    def seed_database(self) -> Dict[str, Any]:
        """
        Reset the non-user tables, preserve existing users, and seed realistic data.

        Returns:
            Summary of seeding operation.
        """
        print("Starting database seeding...")

        Base.metadata.create_all(bind=engine)
        ensure_schema_compatibility()

        summary = self.reset_and_seed_database()
        self.db.close()
        return summary

    def _normalize_legacy_user_roles(self) -> None:
        """Convert legacy uppercase enum values in the users table to the current lowercase enum values."""
        self.db.execute(
            text(
                """
                UPDATE users
                SET role = CASE
                    WHEN role::text = 'ADMIN' THEN 'admin'
                    WHEN role::text = 'STORE_MANAGER' THEN 'store_manager'
                    WHEN role::text = 'RETAIL_ANALYST' THEN 'retail_analyst'
                    WHEN role::text = 'MARKETING_ANALYST' THEN 'marketing_analyst'
                    ELSE role::text
                END
                """
            )
        )
        self.db.commit()
        self.db.expire_all()

    def _load_existing_users(self) -> List[User]:
        """Load users while handling previously stored legacy enum values."""
        try:
            return self.db.query(User).all()
        except LookupError:
            self._normalize_legacy_user_roles()
            return self.db.query(User).all()

    def reset_and_seed_database(self) -> Dict[str, Any]:
        """Preserve user rows while resetting dependent tables and repopulating them."""
        preserved_users = self._load_existing_users()

        self._truncate_non_user_tables()
        self.db.commit()

        if preserved_users:
            preserved_users = self.db.query(User).all()
        else:
            preserved_users = [
                User(
                    full_name="Admin User",
                    email="admin@retailsystem.com",
                    role="admin",
                    password="hashed_password_123",
                ),
                User(
                    full_name="Store Manager",
                    email="manager@retailsystem.com",
                    role="store_manager",
                    password="hashed_password_456",
                ),
                User(
                    full_name="Retail Analyst",
                    email="analyst@retailsystem.com",
                    role="retail_analyst",
                    password="hashed_password_789",
                ),
            ]
            self.db.add_all(preserved_users)
            self.db.commit()
            preserved_users = self.db.query(User).all()

        store_specs = [
            {
                "store_name": "Downtown Retail Center",
                "location": "123 Main St, Downtown",
                "manager_name": "John Smith",
                "logo_url": "https://example.com/logos/downtown.png",
                "theme": "dark",
                "total_shelves": 4,
                "total_cameras": 3,
                "is_live_store": True,
            },
            {
                "store_name": "Mall Store A",
                "location": "456 Shopping Mall",
                "manager_name": "Jane Doe",
                "logo_url": "https://example.com/logos/mall.png",
                "theme": "light",
                "total_shelves": 3,
                "total_cameras": 2,
                "is_live_store": True,
            },
            {
                "store_name": "Suburban Location",
                "location": "789 Suburb Plaza",
                "manager_name": "Mike Johnson",
                "logo_url": "https://example.com/logos/suburban.png",
                "theme": "default",
                "total_shelves": 4,
                "total_cameras": 3,
                "is_live_store": False,
            },
        ]

        stores = [Store(**spec) for spec in store_specs]
        self.db.add_all(stores)
        self.db.flush()

        for index, user in enumerate(preserved_users):
            user.store_id = stores[index % len(stores)].id
            user.is_active = True

        self.db.commit()
        preserved_users = self.db.query(User).all()

        shelves: List[Shelf] = []
        products: List[Product] = []
        cameras: List[Camera] = []
        analytics: List[Analytics] = []
        tracks: List[CustomerTrack] = []
        heatmaps: List[Heatmap] = []
        reports: List[Report] = []
        settings: List[Setting] = []
        detections: List[Detection] = []

        for store in stores:
            store_shelves: List[Shelf] = []
            store_products: List[Product] = []
            store_cameras: List[Camera] = []

            for shelf_index in range(1, store.total_shelves + 1):
                shelf = Shelf(
                    store_id=store.id,
                    shelf_name=f"{store.store_name.split()[0]} Shelf {shelf_index}",
                    shelf_number=f"{store.id}-{shelf_index}",
                    category=["Fresh", "Beverages", "Electronics", "Household"][shelf_index % 4],
                    aisle=f"Aisle {((shelf_index - 1) // 2) + 1}",
                    capacity=120 + shelf_index * 10,
                    status="Active",
                )
                store_shelves.append(shelf)

            self.db.add_all(store_shelves)
            self.db.flush()

            for shelf in store_shelves:
                for product_index in range(1, 5):
                    store_products.append(
                        Product(
                            name=f"{store.store_name.split()[0]} Product {shelf.id}-{product_index}",
                            sku=f"SKU-{store.id}-{shelf.id}-{product_index}",
                            store_id=store.id,
                            shelf_id=shelf.id,
                            category=shelf.category,
                            barcode=f"BAR{store.id}{shelf.id}{product_index:02d}",
                            brand=["BrandA", "BrandB", "BrandC"][product_index % 3],
                            description=f"High-demand item for {shelf.category.lower()} section.",
                            price=round(12.5 + product_index * 3.25, 2),
                            stock_quantity=40 + product_index * 5,
                            status="Active",
                            image_url=f"https://example.com/images/{store.id}-{shelf.id}-{product_index}.png",
                        )
                    )

            self.db.add_all(store_products)
            self.db.flush()

            for camera_index in range(1, store.total_cameras + 1):
                store_cameras.append(
                    Camera(
                        camera_name=f"{store.store_name.split()[0]} Camera {camera_index}",
                        store_id=store.id,
                        rtsp_url=f"rtsp://camera-{store.id}-{camera_index}:554/stream",
                        location=f"Zone {camera_index}",
                        status="Online",
                        camera_type="rtsp",
                        fps=24.0 + camera_index * 0.5,
                        processing_status="Running",
                        current_detection_status="Tracking",
                        video_path=f"/videos/{store.id}/{camera_index}.mp4",
                        last_active_at=None,
                        installed_on=None,
                    )
                )

            self.db.add_all(store_cameras)
            self.db.flush()

            for shelf in store_shelves:
                for camera in store_cameras:
                    analytics.append(
                        Analytics(
                            customer_id=1000 + shelf.id + camera.id,
                            store_id=store.id,
                            camera_id=camera.id,
                            shelf_id=shelf.id,
                            viewed_product=store_products[0].name if store_products else "Demo Product",
                            dwell_time=round(3.5 + (shelf.id % 3), 2),
                            attention_score=round(0.72 + ((shelf.id + camera.id) % 5) * 0.05, 2),
                            distance_to_shelf=round(0.8 + (camera.id % 3) * 0.2, 2),
                            face_direction=["forward", "left", "right"][camera.id % 3],
                            head_angle=float((camera.id % 5) * 8),
                            looking_at_shelf=True,
                            looking_at_product=True,
                            walking_speed=round(0.9 + (store.id % 2) * 0.2, 2),
                            customer_path="Aisle->Shelf->Checkout",
                        )
                    )

                    tracks.append(
                        CustomerTrack(
                            customer_id=2000 + shelf.id + camera.id,
                            store_id=store.id,
                            camera_id=camera.id,
                            shelf_id=shelf.id,
                            product_viewed=store_products[0].name if store_products else "Demo Product",
                            dwell_time=round(5.0 + (camera.id % 4), 2),
                            distance_to_shelf=round(0.6 + (shelf.id % 3) * 0.1, 2),
                            face_direction=["forward", "left", "right"][shelf.id % 3],
                            head_angle=float((shelf.id % 6) * 5),
                            looking_at_shelf=True,
                            looking_at_product=True,
                            walking_speed=round(1.1 + (camera.id % 2) * 0.15, 2),
                            customer_path="Entrance->Shelf->Exit",
                            attention_score=round(0.65 + ((shelf.id + camera.id) % 5) * 0.04, 2),
                        )
                    )

            for camera in store_cameras:
                heatmaps.append(
                    Heatmap(
                        store_id=store.id,
                        camera_id=camera.id,
                        shelf_id=store_shelves[-1].id if store_shelves else None,
                        coordinates={"x": [10, 30, 50], "y": [15, 40, 65]},
                        heatmap_type="movement",
                    )
                )

            reports.append(
                Report(
                    store_id=store.id,
                    report_name=f"{store.store_name} Weekly Summary",
                    report_type="weekly",
                    filters={"range": "7d", "zone": "all"},
                    file_path=f"/reports/{store.id}_weekly.pdf",
                    created_by=preserved_users[0].id if preserved_users else None,
                )
            )
            settings.append(
                Setting(
                    store_id=store.id,
                    store_name=store.store_name,
                    logo_url=store.logo_url,
                    theme=store.theme,
                    jwt_expiry_minutes=480,
                    notification_enabled=True,
                    camera_detection_threshold=0.28,
                    yolo_confidence=0.3,
                )
            )

            for camera in store_cameras:
                for detection_index in range(3):
                    detections.append(
                        Detection(
                            camera_id=camera.id,
                            store_id=store.id,
                            shelf_id=store_shelves[-1].id if store_shelves else None,
                            detected_class=["person", "bottle", "cart"][detection_index % 3],
                            confidence=round(0.78 + detection_index * 0.06, 2),
                            bbox_x=30 + detection_index * 10,
                            bbox_y=40 + detection_index * 5,
                            bbox_w=80,
                            bbox_h=120,
                        )
                    )

            shelves.extend(store_shelves)
            products.extend(store_products)
            cameras.extend(store_cameras)

        self.db.add_all(analytics)
        self.db.add_all(tracks)
        self.db.add_all(heatmaps)
        self.db.add_all(reports)
        self.db.add_all(settings)
        self.db.add_all(detections)
        self.db.commit()

        summary = {
            "stores": len(stores),
            "users": len(preserved_users),
            "shelves": len(shelves),
            "products": len(products),
            "cameras": len(cameras),
            "analytics": len(analytics),
            "customer_tracks": len(tracks),
            "heatmaps": len(heatmaps),
            "reports": len(reports),
            "settings": len(settings),
            "detections": len(detections),
        }

        print("✓ Reset and seeded database with realistic demo data")
        return summary

    def _truncate_non_user_tables(self) -> None:
        """Clear every table except users in a dependency-safe way while preserving user rows."""
        from sqlalchemy import inspect

        self.db.execute(text("UPDATE users SET store_id = NULL WHERE store_id IS NOT NULL"))

        tables = [
            table_name
            for table_name in inspect(engine).get_table_names()
            if table_name not in {"users", "alembic_version"}
        ]

        for table_name in tables:
            try:
                self.db.execute(text(f"TRUNCATE TABLE {table_name} RESTART IDENTITY CASCADE"))
            except Exception as exc:
                print(f"Warning: unable to truncate {table_name}: {exc}")

        self.db.commit()
        self.db.expire_all()

    def import_csv_detections(self, csv_file: str) -> Dict[str, Any]:
        """
        Import detections from CSV file.

        Args:
            csv_file: Path to CSV file with detection data

        Returns:
            Import summary
        """
        if not os.path.exists(csv_file):
            return {"error": f"File not found: {csv_file}"}

        try:
            with open(csv_file, "r") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    detection = Detection(
                        camera_id=int(row.get("camera_id", 1)),
                        store_id=int(row.get("store_id", 1)),
                        shelf_id=int(row.get("shelf_id", 1)),
                        detected_class=row.get("class", "unknown"),
                        confidence=float(row.get("confidence", 0.5)),
                        bbox_x=int(row.get("bbox_x", 0)),
                        bbox_y=int(row.get("bbox_y", 0)),
                        bbox_w=int(row.get("bbox_w", 0)),
                        bbox_h=int(row.get("bbox_h", 0)),
                    )
                    self.db.add(detection)
                    self.imported_count += 1

            self.db.commit()
            return {"success": True, "imported": self.imported_count, "file": csv_file}
        except Exception as e:
            self.error_count += 1
            return {
                "success": False,
                "error": str(e),
                "imported": self.imported_count,
                "errors": self.error_count,
            }

    def import_json_data(self, json_file: str) -> Dict[str, Any]:
        """
        Import data from JSON file.

        Args:
            json_file: Path to JSON file with data

        Returns:
            Import summary
        """
        if not os.path.exists(json_file):
            return {"error": f"File not found: {json_file}"}

        try:
            with open(json_file, "r") as f:
                data = json.load(f)

            summary = {}

            if "stores" in data:
                for store_data in data["stores"]:
                    store = Store(**store_data)
                    self.db.add(store)
                summary["stores"] = len(data["stores"])

            if "cameras" in data:
                for camera_data in data["cameras"]:
                    camera = Camera(**camera_data)
                    self.db.add(camera)
                summary["cameras"] = len(data["cameras"])

            self.db.commit()
            return {"success": True, "summary": summary}
        except Exception as e:
            return {"success": False, "error": str(e)}


def main():
    """Main entry point for seeding."""
    importer = DatasetImporter()
    summary = importer.seed_database()

    print("\n" + "=" * 50)
    print("DATABASE SEEDING COMPLETE")
    print("=" * 50)
    for key, count in summary.items():
        print(f"{key.upper()}: {count}")
    print("=" * 50)


if __name__ == "__main__":
    main()
