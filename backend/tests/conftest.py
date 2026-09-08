import os
import pytest

# Ensure tests run against an isolated in-memory SQLite database
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from app.database.database import Base, get_db
from app.main import app
from app.models.user import User
from app.models.store import Store
from app.models.shelf import Shelf
from app.models.product import Product
from app.models.camera import Camera
from app.models.scoring import ProductScore
from app.utils.security import hash_password, create_access_token

# SQLite in-memory test engine with static pool so all threads share same DB
TEST_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Create all tables once for the test session."""
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def db_session():
    """Yield a fresh DB session wrapped in a transaction that rolls back."""
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db_session):
    """Override FastAPI get_db dependency to point to the test database session."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def test_users(db_session):
    """Seed the 4 role-based users in the test database."""
    users = {
        "admin": User(name="Admin User", email="admin@test.com", password=hash_password("admin123"), role="Admin"),
        "store_manager": User(name="Manager User", email="manager@test.com", password=hash_password("mgr123"), role="Store Manager"),
        "retail_analyst": User(name="Analyst User", email="analyst@test.com", password=hash_password("analyst123"), role="Retail Analyst"),
        "marketing_manager": User(name="Marketing User", email="marketing@test.com", password=hash_password("mkt123"), role="Marketing Manager"),
    }
    for u in users.values():
        db_session.add(u)
    db_session.commit()
    for u in users.values():
        db_session.refresh(u)
    return users


@pytest.fixture
def auth_headers(test_users):
    """Generate Bearer authorization headers for all 4 roles."""
    headers = {}
    for role_key, user in test_users.items():
        token = create_access_token({"sub": user.email, "id": user.id, "role": user.role})
        headers[role_key] = {"Authorization": f"Bearer {token}"}
    return headers


@pytest.fixture
def seeded_store(db_session):
    """Seed sample store, shelf, and product for integration testing."""
    store = Store(name="Flagship Supermarket", location="New York, NY", manager_name="John Doe")
    db_session.add(store)
    db_session.commit()
    db_session.refresh(store)

    shelf = Shelf(name="Aisle 1 - Beverages", store_id=store.id)
    db_session.add(shelf)
    db_session.commit()
    db_session.refresh(shelf)

    product = Product(name="Cold Brew Coffee 250ml", brand="RetailEye Roasters", price=4, shelf_id=shelf.id)
    db_session.add(product)
    db_session.commit()
    db_session.refresh(product)

    camera = Camera(name="CCTV Shelf 1", ip_address="cam_01.mp4", store_id=store.id)
    db_session.add(camera)
    db_session.commit()
    db_session.refresh(camera)

    score = ProductScore(
        product_id=product.id,
        attention_score=85.0,
        interaction_score=70.0,
        pickup_score=60.0,
        purchase_score=50.0,
        repeat_score=20.0,
        final_attractiveness_score=68.25
    )
    db_session.add(score)
    db_session.commit()

    return {
        "store": store,
        "shelf": shelf,
        "product": product,
        "camera": camera,
    }
