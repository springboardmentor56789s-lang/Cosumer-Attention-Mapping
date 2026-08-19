import os
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parents[1]
BACKEND = ROOT / "backend"
if str(BACKEND) not in sys.path:
    sys.path.insert(0, str(BACKEND))

os.environ.setdefault("PYTHONPATH", str(BACKEND))

from app.main import app


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


def test_login_route_accepts_api_login_path(client):
    response = client.post(
        "/api/login",
        json={"email": "missing@example.com", "password": "password"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] in {"Invalid email", "Could not validate credentials"}


def test_auth_login_alias_is_available(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "missing@example.com", "password": "password"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] in {"Invalid email", "Could not validate credentials"}
