from app.database import SessionLocal
from app.models import ProductSKU, Campaign, RestockTask, Store, User, Role
from app.auth import hash_password

db = SessionLocal()

# Seed Products if empty
if db.query(ProductSKU).count() == 0:
    products = [
        ProductSKU(sku_code="SKU-BEV-001", name="Sparkling Citrus Energy Drink", store="All Stores", category="Beverages", shelf_tier="Eye-Level (Golden Zone)", attention_score=94.0, interaction_score=88.0, pickup_score=72.0, conversion_score=68.0, repeat_score=85.0, final_score=86.6, badge="Star Product"),
        ProductSKU(sku_code="SKU-ELE-042", name="Wireless Noise-Cancel Headphones", store="All Stores", category="Electronics", shelf_tier="Eye-Level (Golden Zone)", attention_score=88.0, interaction_score=76.0, pickup_score=55.0, conversion_score=72.0, repeat_score=30.0, final_score=74.6, badge="Steady Performer"),
        ProductSKU(sku_code="SKU-SNK-108", name="Roasted Almonds Mix 500g", store="All Stores", category="Packaged Snacks", shelf_tier="Eye-Level (Golden Zone)", attention_score=80.0, interaction_score=74.0, pickup_score=60.0, conversion_score=58.0, repeat_score=65.0, final_score=72.3, badge="Steady Performer"),
        ProductSKU(sku_code="SKU-TEA-003", name="Organic Green Tea 200g", store="All Stores", category="Beverages", shelf_tier="Top Shelf (Reach)", attention_score=58.0, interaction_score=42.0, pickup_score=38.0, conversion_score=30.0, repeat_score=55.0, final_score=47.9, badge="Underperforming"),
        ProductSKU(sku_code="SKU-BAR-021", name="Gluten-Free Granola Bar", store="All Stores", category="Packaged Snacks", shelf_tier="Bottom Shelf", attention_score=32.0, interaction_score=28.0, pickup_score=22.0, conversion_score=18.0, repeat_score=20.0, final_score=27.1, badge="Underperforming"),
    ]
    db.add_all(products)
    print("Products seeded successfully.")

# Seed Campaigns if empty
if db.query(Campaign).count() == 0:
    campaigns = [
        Campaign(name="Summer Sale", type="Campaign", store="All Stores", status="Live", budget=120000.0, spend=74000.0, reach="24.1K", roi="3.8x", discount_pct=15.0),
        Campaign(name="Festival Offer", type="Campaign", store="Hyderabad Central", status="Live", budget=90000.0, spend=61000.0, reach="18.6K", roi="4.6x", discount_pct=20.0),
        Campaign(name="Weekend Discount", type="Promotion", store="Chennai Flagship", status="Ended", budget=40000.0, spend=40000.0, reach="9.4K", roi="2.1x", discount_pct=25.0),
        Campaign(name="Diwali Mega Sale", type="Campaign", store="All Stores", status="Scheduled", budget=150000.0, spend=0.0, reach="—", roi="—", discount_pct=30.0),
    ]
    db.add_all(campaigns)
    print("Campaigns seeded successfully.")

# Seed Restock Tasks if empty
if db.query(RestockTask).count() == 0:
    tasks = [
        RestockTask(task_code="OOS-01", store="All Stores", shelf_location="Grocery Shelf B — Section 3", shelf_tier="Eye-Level Golden Zone", missing_units=3, priority="CRITICAL", status="Pending"),
        RestockTask(task_code="OOS-02", store="All Stores", shelf_location="Beverage Aisle — Rack 2", shelf_tier="Eye-Level Golden Zone", missing_units=2, priority="CRITICAL", status="In Progress"),
        RestockTask(task_code="OOS-03", store="All Stores", shelf_location="Snacks Shelf A — Row 4", shelf_tier="Top Shelf (Reach)", missing_units=4, priority="STANDARD", status="Pending"),
        RestockTask(task_code="OOS-04", store="All Stores", shelf_location="Checkout Counter Display", shelf_tier="Eye-Level Golden Zone", missing_units=1, priority="HIGH", status="Pending"),
        RestockTask(task_code="OOS-05", store="All Stores", shelf_location="Electronics Shelf 1", shelf_tier="Bottom Shelf", missing_units=2, priority="LOW", status="Done"),
    ]
    db.add_all(tasks)
    print("Restock tasks seeded successfully.")

db.commit()
db.close()
print("All seeding verified.")
