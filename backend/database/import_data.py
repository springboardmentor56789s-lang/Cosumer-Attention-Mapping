"""
Dataset import and seeding module.
Handles loading and importing consumer attention mapping data into the database.
"""

import os
import sys
import csv
import json
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import random

sys.path.append(str(Path(__file__).resolve().parents[2]))

from app.model import Store, Camera, User, Shelf, Detection, UserRole
from database.database import SessionLocal, engine, Base


class DatasetImporter:
    """Handle dataset import and database seeding."""
    
    def __init__(self):
        """Initialize the importer."""
        self.db = SessionLocal()
        self.imported_count = 0
        self.error_count = 0

    def seed_database(self) -> Dict[str, Any]:
        """
        Seed database with initial data.
        
        Returns:
            Summary of seeding operation
        """
        print("Starting database seeding...")
        
        # Create tables
        Base.metadata.create_all(bind=engine)
        
        summary = {
            "stores": self._seed_stores(),
            "users": self._seed_users(),
            "cameras": self._seed_cameras(),
            "shelves": self._seed_shelves(),
            "detections": self._seed_detections()
        }
        
        self.db.close()
        return summary

    def _seed_stores(self) -> int:
        """Seed store data."""
        existing = self.db.query(Store).count()
        if existing > 0:
            print(f"Stores already exist ({existing}). Skipping...")
            return 0
        
        stores = [
            {
                "store_name": "Downtown Retail Center",
                "location": "123 Main St, Downtown",
                "manager_name": "John Smith",
                "total_shelves": 20,
                "total_cameras": 8
            },
            {
                "store_name": "Mall Store A",
                "location": "456 Shopping Mall",
                "manager_name": "Jane Doe",
                "total_shelves": 15,
                "total_cameras": 6
            },
            {
                "store_name": "Suburban Location",
                "location": "789 Suburb Plaza",
                "manager_name": "Mike Johnson",
                "total_shelves": 25,
                "total_cameras": 10
            }
        ]
        
        for store_data in stores:
            store = Store(**store_data)
            self.db.add(store)
        
        self.db.commit()
        print(f"✓ Seeded {len(stores)} stores")
        return len(stores)

    def _seed_users(self) -> int:
        """Seed user data."""
        existing = self.db.query(User).count()
        if existing > 0:
            print(f"Users already exist ({existing}). Skipping...")
            return 0
        
        stores = self.db.query(Store).all()
        if not stores:
            return 0
        
        users = [
            {
                "full_name": "Admin User",
                "email": "admin@retailsystem.com",
                "store_id": stores[0].id,
                "role": UserRole.ADMIN,
                "password": "hashed_password_123"
            },
            {
                "full_name": "Store Manager 1",
                "email": "manager1@retailsystem.com",
                "store_id": stores[0].id,
                "role": UserRole.STORE_MANAGER,
                "password": "hashed_password_456"
            },
            {
                "full_name": "Retail Analyst",
                "email": "analyst@retailsystem.com",
                "store_id": stores[0].id,
                "role": UserRole.RETAIL_ANALYST,
                "password": "hashed_password_789"
            },
            {
                "full_name": "Marketing Manager",
                "email": "marketing@retailsystem.com",
                "store_id": stores[0].id,
                "role": UserRole.MARKETING_ANALYST,
                "password": "hashed_password_000"
            }
        ]
        
        for user_data in users:
            user = User(**user_data)
            self.db.add(user)
        
        self.db.commit()
        print(f"✓ Seeded {len(users)} users")
        return len(users)

    def _seed_cameras(self) -> int:
        """Seed camera data."""
        existing = self.db.query(Camera).count()
        if existing > 0:
            print(f"Cameras already exist ({existing}). Skipping...")
            return 0
        
        stores = self.db.query(Store).all()
        if not stores:
            return 0
        
        cameras = []
        camera_counter = 1
        
        for store in stores:
            for i in range(1, store.total_cameras + 1):
                camera = Camera(
                    camera_name=f"Camera {i}",
                    store_id=store.id,
                    rtsp_url=f"rtsp://demo-camera-{camera_counter}:554/stream",
                    location=f"Zone {i}",
                    status="Online",
                )
                cameras.append(camera)
                camera_counter += 1
        
        self.db.add_all(cameras)
        self.db.commit()
        print(f"✓ Seeded {len(cameras)} cameras")
        return len(cameras)

    def _seed_shelves(self) -> int:
        """Seed shelf data."""
        # Check if Shelf table exists in models
        try:
            existing = self.db.query(Shelf).count()
            if existing > 0:
                print(f"Shelves already exist ({existing}). Skipping...")
                return 0
        except:
            print("Shelf model not found. Skipping shelf seeding...")
            return 0
        
        stores = self.db.query(Store).all()
        if not stores:
            return 0
        
        shelves = []
        for store in stores:
            for i in range(1, store.total_shelves + 1):
                shelf = Shelf(
                    store_id=store.id,
                    shelf_name=f"Shelf {i}",
                    section=f"Section {(i-1)//5 + 1}",
                    category="Product Category",
                    x_position=i * 100,
                    y_position=i * 50,
                    width=80,
                    height=150
                )
                shelves.append(shelf)
        
        self.db.add_all(shelves)
        self.db.commit()
        print(f"✓ Seeded {len(shelves)} shelves")
        return len(shelves)

    def _seed_detections(self) -> int:
        """Seed sample detection data."""
        existing = self.db.query(Detection).count()
        if existing > 0:
            print(f"Detections already exist ({existing}). Skipping...")
            return 0
        
        stores = self.db.query(Store).all()
        cameras = self.db.query(Camera).all()
        
        if not stores or not cameras:
            return 0
        
        detections = []
        classes = ["person", "item", "basket", "trolley"]
        
        # Generate sample detections
        base_time = datetime.now() - timedelta(days=7)
        for i in range(100):
            detection = Detection(
                camera_id=random.choice(cameras).id,
                store_id=random.choice(stores).id,
                shelf_id=random.randint(1, 10),
                detected_class=random.choice(classes),
                confidence=round(random.uniform(0.6, 0.99), 4),
                bbox_x=random.randint(0, 1920),
                bbox_y=random.randint(0, 1080),
                bbox_w=random.randint(50, 300),
                bbox_h=random.randint(50, 300),
                created_at=base_time + timedelta(hours=random.randint(0, 168))
            )
            detections.append(detection)
        
        self.db.add_all(detections)
        self.db.commit()
        print(f"✓ Seeded {len(detections)} sample detections")
        return len(detections)

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
            with open(csv_file, 'r') as f:
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
                        bbox_h=int(row.get("bbox_h", 0))
                    )
                    self.db.add(detection)
                    self.imported_count += 1
            
            self.db.commit()
            return {
                "success": True,
                "imported": self.imported_count,
                "file": csv_file
            }
        except Exception as e:
            self.error_count += 1
            return {
                "success": False,
                "error": str(e),
                "imported": self.imported_count,
                "errors": self.error_count
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
            with open(json_file, 'r') as f:
                data = json.load(f)
            
            summary = {}
            
            # Import stores
            if "stores" in data:
                for store_data in data["stores"]:
                    store = Store(**store_data)
                    self.db.add(store)
                summary["stores"] = len(data["stores"])
            
            # Import cameras
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
    
    print("\n" + "="*50)
    print("DATABASE SEEDING COMPLETE")
    print("="*50)
    for key, count in summary.items():
        print(f"{key.upper()}: {count}")
    print("="*50)


if __name__ == "__main__":
    main()
