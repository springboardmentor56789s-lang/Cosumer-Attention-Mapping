"""
backend/app/main.py
FastAPI Main Application Entrypoint
"""
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from .routers import auth, stores, detection, tracking, streams, analytics, video_analysis, behavior, shelf
from .auth import require_role

app = FastAPI(title="Consumer Attention Mapping System API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Application Routers
app.include_router(auth.router, tags=["Auth"])
app.include_router(stores.router, tags=["Stores"])
app.include_router(detection.router, tags=["Detection"])
app.include_router(tracking.router, tags=["Tracking"])
app.include_router(streams.router, tags=["Streams"])
app.include_router(analytics.router, tags=["Analytics"])
app.include_router(video_analysis.router, tags=["Video Analysis"])
app.include_router(behavior.router, tags=["Behaviour Intelligence"])
app.include_router(shelf.router, tags=["Shelf Planogram & Stock AI"])

@app.get("/")
def root_health_check():
    return {"status": "online", "system": "Consumer Attention Mapping System API", "version": "2.0.0"}

@app.get("/admin-only")
def admin_only(user = Depends(require_role("admin"))):
    return {"message": f"Welcome, {user.name}"}