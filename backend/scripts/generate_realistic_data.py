import sys
import os
import random
from datetime import datetime, timedelta

# Ensure we can import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import everything in exact order to avoid SQLAlchemy relationship errors
from app.models.store import Store
from app.models.camera import Camera
from app.models.shelf import Shelf
from app.models.shelf_snapshot import ShelfSnapshot
from app.models.product import Product
from app.models.tracking import TrackingSession, ZoneEvent
from app.models.behavior import BehaviorProfile
from app.models.dwell import DwellEvent
from app.models.interaction import ProductInteraction
from app.models.attention import AttentionEvent
from app.models.scoring import ProductScore

from app.database.database import SessionLocal
from app.services.scoring_engine import ScoringEngine

def generate_data():
    db = SessionLocal()

    print("🧹 Clearing old interactions and attention events...")
    db.query(ProductInteraction).delete()
    db.query(AttentionEvent).delete()
    db.commit()

    sessions = db.query(TrackingSession).all()
    if not sessions:
        print("Creating dummy tracking sessions...")
        for i in range(10):
            s = TrackingSession(start_time=datetime.utcnow() - timedelta(days=1), customer_id=f"cust_{i}")
            db.add(s)
        db.commit()
        sessions = db.query(TrackingSession).all()

    shelves = db.query(Shelf).all()
    products = db.query(Product).all()
    
    if not products:
        print("⚠️ No products found in the database. Please make sure products exist first!")
        return

    print(f"📊 Generating realistic attention events for {len(shelves)} shelves...")
    for shelf in shelves:
        for i in range(random.randint(15, 30)):
            db.add(AttentionEvent(
                session_id=random.choice(sessions).id,
                shelf_id=shelf.id,
                start_time=datetime.utcnow(),
                duration=random.uniform(10.0, 80.0)
            ))
    db.commit()

    print(f"🛍️ Generating realistic product interactions for {len(products)} products...")
    for product in products:
        name = product.name.lower()
        
        # Profile 1: High Attention, Low Purchase (e.g. expensive or visually striking but people don't buy)
        if "coca-cola" in name or "coca cola" in name:
            total = random.randint(45, 60)
            picks = random.randint(15, 25)
            purchases = random.randint(0, 3)
            
        # Profile 2: Medium across the board (Average performer)
        elif "doritos" in name:
            total = random.randint(30, 45)
            picks = random.randint(15, 25)
            purchases = random.randint(10, 15)
            
        # Profile 3: Low Attention, High Purchase (Hidden Gem - people know exactly what they want)
        elif "pepsi" in name:
            total = random.randint(10, 20)
            picks = random.randint(10, 15)
            purchases = random.randint(9, 14)
            
        # Profile 4: Random fill for everything else
        else:
            total = random.randint(10, 40)
            picks = random.randint(2, max(3, int(total/2)))
            purchases = random.randint(0, picks)
            
        for _ in range(total - picks - purchases):
            db.add(ProductInteraction(session_id=random.choice(sessions).id, product_id=product.id, interaction_type="viewed"))
        for _ in range(picks):
            db.add(ProductInteraction(session_id=random.choice(sessions).id, product_id=product.id, interaction_type="picked_up"))
        for _ in range(purchases):
            db.add(ProductInteraction(session_id=random.choice(sessions).id, product_id=product.id, interaction_type="purchased"))

    db.commit()

    print("🧮 Recalculating AI scores using the formula...")
    ScoringEngine.calculate_all_scores(db)
    print("✅ Done! Fake realistic data successfully inserted. Refresh your dashboard!")

if __name__ == "__main__":
    generate_data()
