from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from .routers import auth
from .auth import require_role

app = FastAPI(title="Consumer Attention Mapping System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, tags=["Auth"])

@app.get("/admin-only")
def admin_only(user = Depends(require_role("admin"))):
    return {"message": f"Welcome, {user.name}"}