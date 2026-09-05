from pathlib import Path

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app import model
from app.auth import get_password_hash
from app.main import app
from app.services.dynamic_report_data import (
    generate_consumer_attention_report,
    generate_product_engagement_report,
    generate_shelf_performance_report,
    get_dynamic_report_data,
)
from database.database import get_db


def _build_store_session():
    engine = create_engine("sqlite://")
    model.Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    store = model.Store(
        store_name="Main Store",
        location="Downtown",
        manager_name="Alice",
        total_shelves=1,
        total_cameras=1,
        is_live_store=True,
    )
    db.add(store)
    db.commit()
    db.refresh(store)

    shelf = model.Shelf(
        shelf_name="Aisle A",
        shelf_number="A-1",
        store_id=store.id,
        category="Beverages",
        capacity=10,
        status="Active",
    )
    db.add(shelf)
    db.commit()
    db.refresh(shelf)

    product = model.Product(
        name="Coca Cola",
        sku="SKU-001",
        store_id=store.id,
        shelf_id=shelf.id,
        category="Beverages",
        stock_quantity=5,
        status="Active",
    )
    db.add(product)
    db.commit()
    db.refresh(product)

    analytics = model.Analytics(
        customer_id=101,
        store_id=store.id,
        camera_id=1,
        shelf_id=shelf.id,
        viewed_product="SKU-001",
        dwell_time=8.5,
        attention_score=72.4,
        looking_at_product=True,
        looking_at_shelf=True,
    )
    db.add(analytics)
    db.commit()

    return db, store


def test_google_login_is_explicitly_separate_from_email_login():
    login_html = Path(
        "c:/Users/parni/Desktop/AI_Consumer_Attension_Mapping_System/Parnika_AI_Consumer-Attention-Mapping-System/frontend/templates/login.html"
    ).read_text(encoding="utf-8")

    assert 'id="googleLoginBtn"' in login_html
    assert 'type="button"' in login_html
    assert 'action="/api/login"' in login_html
    assert 'href="/api/auth/google/login"' in login_html


def test_dynamic_consumer_attention_report_has_only_requested_fields():
    db, store = _build_store_session()

    payload = get_dynamic_report_data(db, "consumer_attention", store.id)

    assert list(payload["rows"][0]) == [
        "track_customer_id", "average_attention_score", "total_dwell_time", "shelves_visited", "behaviour",
    ]
    assert payload["rows"][0]["track_customer_id"] == 101
    assert payload["rows"][0]["average_attention_score"] == 72.4


def test_customer_attention_report_aggregates_each_track_once():
    db, store = _build_store_session()
    db.add_all(
        [
            model.Analytics(
                customer_id=customer_id,
                store_id=store.id,
                camera_id=1,
                dwell_time=2.0,
                attention_score=float(customer_id),
            )
            for customer_id in range(1, 15)
        ]
        + [
            model.Analytics(
                customer_id=1,
                store_id=store.id,
                camera_id=1,
                shelf_id=1,
                dwell_time=4.0,
                attention_score=80.0,
                looking_at_product=True,
            )
        ]
    )
    db.commit()

    rows = generate_consumer_attention_report(db, store.id)["rows"]
    first_customer = next(row for row in rows if row["track_customer_id"] == 1)

    assert len(rows) == 15
    assert len({row["track_customer_id"] for row in rows}) == 15
    assert first_customer["total_dwell_time"] == 6.0
    assert first_customer["average_attention_score"] == 40.5
    assert first_customer["shelves_visited"] == "1"


def test_entity_level_reports_cover_every_customer_shelf_and_product():
    db, store = _build_store_session()

    shelf_two = model.Shelf(
        shelf_name="Aisle B",
        shelf_number="B-1",
        store_id=store.id,
        category="Snacks",
        capacity=12,
        status="Active",
    )
    db.add(shelf_two)
    db.commit()
    db.refresh(shelf_two)

    product_two = model.Product(
        name="Pepsi",
        sku="SKU-002",
        store_id=store.id,
        shelf_id=shelf_two.id,
        category="Beverages",
        stock_quantity=4,
        status="Active",
    )
    db.add(product_two)
    db.commit()
    db.refresh(product_two)

    db.add_all(
        [
            model.Analytics(
                customer_id=101,
                store_id=store.id,
                camera_id=1,
                shelf_id=1,
                viewed_product="SKU-001",
                dwell_time=7.0,
                attention_score=80.0,
                looking_at_product=True,
                looking_at_shelf=True,
            ),
            model.Analytics(
                customer_id=202,
                store_id=store.id,
                camera_id=1,
                shelf_id=2,
                viewed_product="SKU-002",
                dwell_time=4.0,
                attention_score=62.0,
                looking_at_product=True,
                looking_at_shelf=False,
            ),
        ]
    )
    db.commit()

    customer_rows = generate_consumer_attention_report(db, store.id)["rows"]
    shelf_rows = generate_shelf_performance_report(db, store.id)["rows"]
    product_rows = generate_product_engagement_report(db, store.id)["rows"]

    customer_ids = {row["track_customer_id"] for row in customer_rows}
    assert customer_ids == {101, 202}
    assert any(row["track_customer_id"] == 101 and row["total_dwell_time"] >= 15.5 for row in customer_rows)

    shelf_ids = {row["shelf_id"] for row in shelf_rows}
    assert shelf_ids == {1, 2}
    assert any(row["shelf_id"] == 1 and row["customers"] >= 1 for row in shelf_rows)
    assert any(row["shelf_id"] == 2 and row["customers"] >= 1 for row in shelf_rows)

    product_names = {row["product_name"] for row in product_rows}
    assert product_names == {"Coca Cola", "Pepsi"}
    assert any(row["product_name"] == "Coca Cola" and row["customers_engaged"] >= 1 for row in product_rows)
    assert any(row["product_name"] == "Pepsi" and row["customers_engaged"] >= 1 for row in product_rows)


def test_dynamic_reports_and_bearer_exports_work_without_report_rows():
    test_engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    model.Base.metadata.create_all(bind=test_engine)
    TestingSessionLocal = sessionmaker(bind=test_engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    try:
        db = TestingSessionLocal()
        store = model.Store(
            store_name="Main Store",
            location="Downtown",
            manager_name="Alice",
            total_shelves=1,
            total_cameras=1,
            is_live_store=True,
        )
        db.add(store)
        db.commit()
        db.refresh(store)

        shelf = model.Shelf(
            shelf_name="Aisle A",
            shelf_number="A-1",
            store_id=store.id,
            category="Beverages",
            capacity=10,
            status="Active",
        )
        db.add(shelf)
        db.commit()
        db.refresh(shelf)

        product = model.Product(
            name="Coca Cola",
            sku="SKU-001",
            store_id=store.id,
            shelf_id=shelf.id,
            category="Beverages",
            stock_quantity=5,
            status="Active",
        )
        db.add(product)
        db.commit()
        db.refresh(product)

        db.add(
            model.Analytics(
                customer_id=101,
                store_id=store.id,
                camera_id=1,
                shelf_id=shelf.id,
                viewed_product="SKU-001",
                dwell_time=8.5,
                attention_score=72.4,
                looking_at_product=True,
                looking_at_shelf=True,
            )
        )
        db.commit()

        admin = model.User(
            full_name="Admin User",
            email="admin@example.com",
            password=get_password_hash("secret123"),
            role=model.UserRole.ADMIN,
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)

        client = TestClient(app)
        login_response = client.post("/api/login", json={"email": "admin@example.com", "password": "secret123"})
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        assert db.query(model.Report).count() == 0
        for report_type in ["consumer_attention", "product_engagement", "shelf_performance"]:
            detail_response = client.get(
                f"/api/production/reports/detail/{report_type}?store_id={store.id}",
                headers=headers,
            )
            assert detail_response.status_code == 200, detail_response.text
            payload = detail_response.json()
            assert "rows" in payload["data"]

            csv_response = client.get(
                f"/api/production/reports/export?report_type={report_type}&store_id={store.id}&format=csv",
                headers=headers,
            )
            assert csv_response.status_code == 200, csv_response.text
            assert "text/csv" in csv_response.headers.get("content-type", "")
            assert report_type in csv_response.headers.get("content-disposition", "")

            xlsx_response = client.get(
                f"/api/production/reports/export?report_type={report_type}&store_id={store.id}&format=xlsx",
                headers=headers,
            )
            assert xlsx_response.status_code == 200, xlsx_response.text
            assert "spreadsheetml" in xlsx_response.headers.get("content-type", "")
            assert report_type in xlsx_response.headers.get("content-disposition", "")

            pdf_response = client.get(
                f"/api/production/reports/export?report_type={report_type}&store_id={store.id}&format=pdf",
                headers=headers,
            )
            assert pdf_response.status_code == 200, pdf_response.text
            assert "application/pdf" in pdf_response.headers.get("content-type", "")
            assert db.query(model.Report).count() == 0
    finally:
        app.dependency_overrides.clear()
