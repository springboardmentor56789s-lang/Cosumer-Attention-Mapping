import json
import os
import secrets
import urllib.parse
import urllib.request
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlalchemy.orm import Session

from app.auth import ACCESS_TOKEN_EXPIRE_MINUTES, create_access_token, get_password_hash
from app.model import User, UserRole
from database.database import get_db

router = APIRouter(prefix="/api", tags=["Google Auth"])

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
GOOGLE_REDIRECT_URI = os.getenv(
    "GOOGLE_REDIRECT_URI",
    "http://127.0.0.1:8000/api/auth/google/callback",
)
GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"


def _post_json(url: str, data: dict, headers: Optional[dict] = None):
    encoded = urllib.parse.urlencode(data).encode("utf-8")
    req = urllib.request.Request(url, data=encoded, headers=headers or {}, method="POST")
    with urllib.request.urlopen(req, timeout=20) as response:
        return json.loads(response.read().decode("utf-8"))


def _get_json(url: str, headers: Optional[dict] = None):
    req = urllib.request.Request(url, headers=headers or {}, method="GET")
    with urllib.request.urlopen(req, timeout=20) as response:
        return json.loads(response.read().decode("utf-8"))


@router.get("/auth/google/login")
async def google_login(request: Request):
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(
            status_code=500,
            detail="Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
        )

    state = secrets.token_urlsafe(16)
    request.session["google_oauth_state"] = state

    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent",
        "state": state,
    }

    return RedirectResponse(f"{GOOGLE_AUTH_URL}?{urllib.parse.urlencode(params)}")


@router.get("/auth/google/callback")
async def google_callback(
    request: Request,
    code: Optional[str] = None,
    state: Optional[str] = None,
    error: Optional[str] = None,
    db: Session = Depends(get_db),
):
    if error:
        raise HTTPException(status_code=400, detail=f"Google OAuth error: {error}")

    expected_state = request.session.pop("google_oauth_state", None)
    if not expected_state or state != expected_state:
        raise HTTPException(status_code=400, detail="Invalid Google OAuth state")

    if not code:
        raise HTTPException(status_code=400, detail="Google OAuth code was not provided")

    token_payload = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code",
    }

    token_data = _post_json(GOOGLE_TOKEN_URL, token_payload, {"Content-Type": "application/x-www-form-urlencoded"})
    access_token = token_data.get("access_token")

    if not access_token:
        raise HTTPException(status_code=400, detail="Google did not return an access token")

    userinfo = _get_json(GOOGLE_USERINFO_URL, {"Authorization": f"Bearer {access_token}"})
    email = userinfo.get("email")

    if not email:
        raise HTTPException(status_code=400, detail="Google did not return an email address")

    full_name = userinfo.get("name") or email.split("@", 1)[0]

    db_user = db.query(User).filter(User.email == email).first()

    if not db_user:
        db_user = User(
            full_name=full_name,
            email=email,
            password=get_password_hash(secrets.token_urlsafe(24)),
            role=UserRole.RETAIL_ANALYST,
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

    role_value = db_user.role.value if hasattr(db_user.role, "value") else str(db_user.role)
    token = create_access_token({"sub": db_user.email, "role": role_value})

    return RedirectResponse(
        f"/api/auth/google/success?token={urllib.parse.quote(token)}&role={urllib.parse.quote(role_value)}&full_name={urllib.parse.quote(db_user.full_name)}"
    )


@router.get("/auth/google/success")
async def google_auth_success(request: Request):
    token = request.query_params.get("token", "")
    role = request.query_params.get("role", "")
    full_name = request.query_params.get("full_name", "")

    page = f"""<!DOCTYPE html>
<html lang=\"en\">
<head>
  <meta charset=\"utf-8\">
  <meta http-equiv=\"refresh\" content=\"0;url=/\" />
  <title>Signing in…</title>
</head>
<body>
<script>
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token') || '';
  const role = params.get('role') || '';
  const fullName = params.get('full_name') || '';
  if (token) {{
    localStorage.setItem('access_token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('full_name', fullName);
  }}
  const routeMap = {{
    admin: '/admin/dashboard',
    store_manager: '/store/dashboard',
    retail_analyst: '/retail/dashboard',
    marketing_analyst: '/marketing/dashboard'
  }};
  const target = routeMap[role] || '/';
  window.location.href = target;
</script>
</body>
</html>"""
    response = HTMLResponse(page)
    if token:
        response.set_cookie(
            key="access_token",
            value=token,
            max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            path="/",
            samesite="lax",
        )
    return response
