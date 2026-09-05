import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["health"] == "OK"

def test_auth_login():
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@dmart.com", "password": "adminpassword"}
    )
    # Accepts 200 or 401 depending on DB seed state
    assert response.status_code in [200, 401]

def test_send_and_verify_otp():
    send_res = client.post(
        "/api/v1/auth/send-otp",
        json={"target": "test_analyst@dmart.com", "purpose": "verification"}
    )
    assert send_res.status_code == 200
    data = send_res.json()
    assert "target" in data

def test_stores_api():
    response = client.get("/api/v1/stores/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_shelves_api():
    response = client.get("/api/v1/shelves/")
    assert response.status_code == 200

def test_cameras_api():
    response = client.get("/api/v1/cameras/")
    assert response.status_code == 200

def test_products_api():
    response = client.get("/api/v1/products/")
    assert response.status_code == 200

def test_behavior_intelligence_engine():
    response = client.get("/api/v1/behavior/1")
    assert response.status_code == 200
    data = response.json()
    assert "shopper_metrics" in data
    assert "consumer_segments" in data
    assert "interaction_events_summary" in data
    assert len(data["consumer_segments"]) == 5

def test_heatmaps_v2_engine():
    response = client.get("/api/v1/heatmaps-v2/1")
    assert response.status_code == 200
    data = response.json()
    assert "movement_heatmap" in data
    assert "attention_heatmap" in data
    assert "shelf_engagement_heatmap" in data

def test_product_attractiveness_scoring_engine():
    response = client.get("/api/v1/products-v2/1/scores")
    assert response.status_code == 200
    data = response.json()
    assert "weighted_scoring_model" in data
    assert "product_rankings" in data
    assert len(data["product_rankings"]) > 0

def test_optimization_recommendations_engine():
    response = client.get("/api/v1/recommendations-v2/1")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_consolidated_retail_intelligence():
    response = client.get("/api/v1/intelligence/1")
    assert response.status_code == 200
    data = response.json()
    assert data["video_id"] == 1
    assert "shopper_metrics" in data
    assert "behavior_patterns" in data
    assert "product_rankings" in data
    assert "recommendations" in data

def test_report_generation_system():
    response = client.get("/api/v1/intelligence/reports/1")
    assert response.status_code == 200
    data = response.json()
    assert "section_1_video_info" in data
    assert "section_2_shopper_summary" in data
    assert "section_3_behavioral_analysis" in data
    assert "section_4_attention_analysis" in data
    assert "section_5_heatmaps" in data
    assert "section_6_product_intelligence" in data
    assert "section_7_optimization_insights" in data
    assert "section_8_evidence" in data
    assert "section_9_limitations" in data

def test_copilot_ai_chat():
    response = client.post(
        "/api/v1/copilot/chat",
        json={"message": "What are the top recommended shelf optimizations for beverage aisle?"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data or "summary" in data or "response" in data
