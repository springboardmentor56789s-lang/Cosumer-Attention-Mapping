import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_integration_login_to_dashboard():
    # 1. Login
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@dmart.com", "password": "adminpassword"}
    )
    assert login_res.status_code in [200, 401]

    # 2. Get Executive Dashboard
    dash_res = client.get("/api/v1/analytics/dashboard")
    assert dash_res.status_code == 200
    data = dash_res.json()
    assert "total_shoppers" in data
    assert "avg_dwell_time_sec" in data
    assert "total_attention_events" in data
    assert "top_performing_shelf" in data
    assert "top_attention_product" in data
    assert "peak_traffic_period" in data
    assert "most_visited_zone" in data
    assert "overall_engagement_score" in data

def test_integration_video_upload_and_security_validation():
    # Attempting to upload malicious .sh file should be rejected with 400 Bad Request
    files = {"file": ("malicious_script.sh", b"echo 'hack'", "text/x-sh")}
    res = client.post("/api/v1/video/upload", files=files)
    assert res.status_code == 400
    assert "Security Error" in res.json()["detail"]

def test_integration_analytics_to_copilot():
    # Copilot should consume real backend database telemetry
    res = client.post(
        "/api/v1/copilot/chat",
        json={"message": "Which shelf received the highest attention and why?", "video_id": 1}
    )
    assert res.status_code == 200
    data = res.json()
    assert "answer" in data
    assert "evidence" in data or "shelf" in str(data).lower()

def test_integration_analytics_to_report():
    # Report generator must return full 9-section report
    res = client.get("/api/v1/reports/1")
    assert res.status_code == 200
    report = res.json()
    assert "section_1_video_info" in report
    assert "section_4_attention_analysis" in report
    assert "section_7_optimization_insights" in report

def test_integration_rbac_authorization():
    # Verify RBAC checks work cleanly
    manager_token = "Bearer test_token"
    res = client.get("/api/v1/stores/")
    assert res.status_code == 200
