import pytest


# ═════════════════════════════════════════════════════════════════════════════
# INPUT VALIDATION & ERROR HANDLING TESTS
# ═════════════════════════════════════════════════════════════════════════════

def test_validation_invalid_email_format(client):
    """Verify that malformed email addresses are rejected with 422 Unprocessable Entity."""
    payload = {
        "name": "Invalid Email User",
        "email": "not-a-valid-email",
        "password": "some_password_123",
        "role": "Store Manager"
    }
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 422
    errors = response.json().get("detail", [])
    assert any("email" in str(err) for err in errors)


def test_validation_missing_required_fields_on_product(client, auth_headers, seeded_store):
    """Verify that omitting required fields on product creation returns 422."""
    incomplete_payload = {
        "name": "Orphan Product",
        # Missing "brand", "price", and "shelf_id"
    }
    response = client.post("/products/", json=incomplete_payload, headers=auth_headers["admin"])
    assert response.status_code == 422


def test_validation_invalid_datatype_rejection(client, auth_headers, seeded_store):
    """Verify that sending a string for a numeric field returns 422."""
    invalid_type_payload = {
        "name": "Sample Product",
        "brand": "Brand X",
        "price": "not-a-number",
        "shelf_id": seeded_store["shelf"].id
    }
    response = client.post("/products/", json=invalid_type_payload, headers=auth_headers["admin"])
    assert response.status_code == 422


def test_validation_unauthenticated_request_rejected(client):
    """Verify that requesting protected resources without auth returns 401."""
    response = client.get("/stores/999999")
    assert response.status_code == 401


def test_validation_nonexistent_resource_with_auth_returns_404(client, auth_headers):
    """Verify that requesting an entity with a non-existent ID returns 404 when authenticated."""
    response = client.get("/stores/999999", headers=auth_headers["admin"])
    assert response.status_code == 404


def test_dashboard_invalid_store_filter_handled_gracefully(client):
    """Verify that passing an invalid store_id filter does not crash the server (returns empty/default)."""
    response = client.get("/dashboard/store-manager?store_id=999999")
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "Store Manager"
    assert data["kpis"]["total_shoppers"] == 0
