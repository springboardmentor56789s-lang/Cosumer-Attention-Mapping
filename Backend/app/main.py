from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from .routers import auth, stores, detection, tracking
from .auth import require_role

app = FastAPI(title="Consumer Attention Mapping System")

# Updated CORS middleware for seamless Next.js frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
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

@app.get("/")
def root_health_check():
    return {"status": "online", "system": "Consumer Attention Mapping System API"}

@app.get("/admin-only")
def admin_only(user = Depends(require_role("admin"))):
    return {"message": f"Welcome, {user.name}"}