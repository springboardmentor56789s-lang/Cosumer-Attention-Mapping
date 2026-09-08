import pytest


# ═════════════════════════════════════════════════════════════════════════════
# 1. AUTHENTICATION API TESTS
# ═════════════════════════════════════════════════════════════════════════════

def test_auth_login_success(client, test_users):
    """Test login with valid credentials returns access_token and bearer type."""
    response = client.post(
        "/auth/login",
        data={"username": "admin@test.com", "password": "admin123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_auth_login_invalid_password(client, test_users):
    """Test login with incorrect password returns 401 Unauthorized."""
    response = client.post(
        "/auth/login",
        data={"username": "admin@test.com", "password": "wrong_password"}
    )
    assert response.status_code == 401
    assert "Invalid" in response.json()["detail"]


def test_auth_login_nonexistent_user(client, db_session):
    """Test login with an unregistered email returns 401 Unauthorized."""
    response = client.post(
        "/auth/login",
        data={"username": "ghost@test.com", "password": "nopassword"}
    )
    assert response.status_code == 401


def test_auth_register_new_user(client, db_session):
    """Test user registration endpoint creates new user."""
    payload = {
        "name": "New Tester",
        "email": "newtester@retaileye.ai",
        "password": "pass_secure_123",
        "role": "Retail Analyst"
    }
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "newtester@retaileye.ai"
    assert data["role"] == "Retail Analyst"
    assert "password" not in data


def test_auth_register_duplicate_email(client, test_users):
    """Test registering an existing email returns 400 Bad Request."""
    payload = {
        "name": "Duplicate Admin",
        "email": "admin@test.com",
        "password": "another_pass_123",
        "role": "Admin"
    }
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]


# ═════════════════════════════════════════════════════════════════════════════
# 2. ROLE-BASED ACCESS CONTROL (RBAC) TESTS
# ═════════════════════════════════════════════════════════════════════════════

def test_rbac_unauthorized_access_rejected(client):
    """Verify that accessing protected endpoints without an Authorization token returns 401."""
    response = client.get("/stores/")
    assert response.status_code == 401
    assert "Not authenticated" in response.text or "detail" in response.json()


def test_rbac_authorized_access_accepted(client, auth_headers, seeded_store):
    """Verify that providing a valid Bearer token grants access to protected endpoints."""
    response = client.get("/stores/", headers=auth_headers["admin"])
    assert response.status_code == 200
    assert len(response.json()) >= 1


# ═════════════════════════════════════════════════════════════════════════════
# 3. EXECUTIVE DASHBOARD API TESTS (Milestone 4)
# ═════════════════════════════════════════════════════════════════════════════

def test_dashboard_stores_filter_endpoint(client, seeded_store):
    """Verify /dashboard/stores returns registered stores with id and name."""
    response = client.get("/dashboard/stores")
    assert response.status_code == 200
    stores = response.json()
    assert isinstance(stores, list)
    assert len(stores) >= 1
    assert stores[0]["name"] == "Flagship Supermarket"


def test_dashboard_store_manager_view(client, seeded_store):
    """Verify /dashboard/store-manager returns KPIs, traffic, shelf performance, funnel."""
    response = client.get(f"/dashboard/store-manager?store_id={seeded_store['store'].id}")
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "Store Manager"
    assert "kpis" in data
    assert "hourly_traffic" in data
    assert "shelf_performance" in data
    assert "conversion_funnel" in data
    assert "product_engagement" in data

    kpis = data["kpis"]
    assert "total_shoppers" in kpis
    assert "avg_journey_seconds" in kpis
    assert "conversion_rate_pct" in kpis


def test_dashboard_retail_analyst_view(client, seeded_store):
    """Verify /dashboard/retail-analyst returns consumer segments, routes, heatmaps, scores."""
    response = client.get(f"/dashboard/retail-analyst?store_id={seeded_store['store'].id}")
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "Retail Analyst"
    assert "consumer_segments" in data
    assert "top_routes" in data
    assert "zone_heatmaps" in data
    assert "product_attractiveness" in data

    segments = [s["segment"] for s in data["consumer_segments"]]
    for expected in ["Explorer", "Quick Buyer", "Comparison Shopper", "Impulse Buyer", "Brand Loyal"]:
        assert any(expected in seg for seg in segments)


def test_dashboard_marketing_manager_view(client, seeded_store):
    """Verify /dashboard/marketing-manager returns visibility SKUs, recommendations, categories."""
    response = client.get(f"/dashboard/marketing-manager?store_id={seeded_store['store'].id}")
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "Marketing Manager"
    assert "kpis" in data
    assert "product_visibility" in data
    assert "high_visibility" in data["product_visibility"]
    assert "low_visibility" in data["product_visibility"]
    assert "category_metrics" in data
    assert "promotional_recommendations" in data


def test_dashboard_admin_system_view(client, seeded_store):
    """Verify /dashboard/admin returns platform metrics, camera health, and AI telemetry."""
    response = client.get("/dashboard/admin")
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "Administrator"
    assert "platform_metrics" in data
    assert "cameras" in data
    assert "services_health" in data

    health_services = [s["service"] for s in data["services_health"]]
    assert "FastAPI Gateway" in health_services
    assert "PostgreSQL Database" in health_services
    assert "YOLOv8 Person Detection" in health_services
    assert "ByteTrack Multi-Object Tracker" in health_services


# ═════════════════════════════════════════════════════════════════════════════
# 4. CORE ENTITY ENDPOINT RETRIEVAL TESTS
# ═════════════════════════════════════════════════════════════════════════════

def test_stores_endpoint(client, auth_headers, seeded_store):
    """Test /stores/ returns list of stores for authenticated users."""
    response = client.get("/stores/", headers=auth_headers["admin"])
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["name"] == "Flagship Supermarket"


def test_shelves_endpoint(client, auth_headers, seeded_store):
    """Test /shelves/ returns list of shelves for authenticated users."""
    response = client.get("/shelves/", headers=auth_headers["admin"])
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["name"] == "Aisle 1 - Beverages"


def test_products_endpoint(client, auth_headers, seeded_store):
    """Test /products/ returns list of products for authenticated users."""
    response = client.get("/products/", headers=auth_headers["admin"])
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["name"] == "Cold Brew Coffee 250ml"


def test_cameras_endpoint(client, auth_headers, seeded_store):
    """Test /cameras/ returns configured camera feeds for admin."""
    response = client.get("/cameras/", headers=auth_headers["admin"])
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["name"] == "CCTV Shelf 1"
