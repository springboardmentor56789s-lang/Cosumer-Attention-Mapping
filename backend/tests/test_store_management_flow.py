from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app import model
from app.auth import get_password_hash
from app.main import app
from database.database import get_db


def test_existing_store_loads_after_admin_login_without_duplicate_seed():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    model.Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(bind=engine)

    db = TestingSessionLocal()
    existing_store = model.Store(
        store_name="Existing Store",
        location="Main Street",
        manager_name="Store Lead",
        total_shelves=15,
        total_cameras=1,
        is_live_store=False,
    )
    admin = model.User(
        full_name="Admin User",
        email="admin@example.com",
        password=get_password_hash("secret123"),
        role=model.UserRole.ADMIN,
    )
    db.add_all([existing_store, admin])
    db.commit()
    db.close()

    def override_get_db():
        session = TestingSessionLocal()
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_db] = override_get_db

    try:
        client = TestClient(app)

        login_response = client.post(
            "/api/login",
            json={"email": "admin@example.com", "password": "secret123"},
        )
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]

        unauthenticated_response = client.get("/api/stores")
        assert unauthenticated_response.status_code == 401
        assert unauthenticated_response.json()["detail"] == "Not authenticated"

        stores_response = client.get(
            "/api/stores",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert stores_response.status_code == 200
        stores = stores_response.json()
        assert [store["store_name"] for store in stores] == ["Existing Store"]

        check_db = TestingSessionLocal()
        try:
            assert check_db.query(model.Store).count() == 1
        finally:
            check_db.close()
    finally:
        app.dependency_overrides.clear()
