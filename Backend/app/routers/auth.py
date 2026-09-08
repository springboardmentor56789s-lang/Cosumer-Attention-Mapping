from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Role
from ..auth import hash_password, verify_password, create_access_token
from ..auth import require_role
from ..auth import  get_current_user

from typing import Optional

router = APIRouter()

def infer_role_from_email(email: str, explicit_role: Optional[str] = None) -> str:
    email_lower = email.lower()
    if "admin" in email_lower:
        return "admin"
    elif "analyst" in email_lower:
        return "retail_analyst"
    elif "marketing" in email_lower or "mktg" in email_lower:
        return "marketing_manager"
    elif "store" in email_lower or "manager" in email_lower:
        return "store_manager"
    elif "exec" in email_lower or "ceo" in email_lower or "coo" in email_lower or "leadership" in email_lower:
        return "executive"
    
    # If no keyword matched, use explicit role or fallback
    if explicit_role and explicit_role.strip():
        return explicit_role.strip()
    return "retail_analyst"

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role_name: Optional[str] = None  # inferred if omitted or based on email

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/register")
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    role_to_assign = infer_role_from_email(payload.email, payload.role_name)

    role = db.query(Role).filter(Role.name == role_to_assign).first()
    if not role:
        role = Role(name=role_to_assign)
        db.add(role)
        db.commit()
        db.refresh(role)

    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role_id=role.id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.email, "role": role.name})
    return {
        "message": "User registered successfully",
        "user_id": user.id,
        "name": user.name,
        "email": user.email,
        "role": role.name,
        "access_token": token,
        "token_type": "bearer"
    }

@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # If the user's email explicitly matches a role keyword (e.g. admin or analyst), ensure sync
    inferred = infer_role_from_email(user.email, user.role.name)
    if inferred != user.role.name:
        role_obj = db.query(Role).filter(Role.name == inferred).first()
        if not role_obj:
            role_obj = Role(name=inferred)
            db.add(role_obj)
            db.commit()
            db.refresh(role_obj)
        user.role_id = role_obj.id
        db.commit()
        db.refresh(user)

    token = create_access_token({"sub": user.email, "role": user.role.name})
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role.name,
        "name": user.name,
        "email": user.email,
    }

def normalize_role_name(role_str: str) -> str:
    r = (role_str or "").strip().lower()
    if "admin" in r:
        return "admin"
    if "analyst" in r:
        return "retail_analyst"
    if "marketing" in r:
        return "marketing_manager"
    if "store" in r or "manager" in r:
        return "store_manager"
    if "exec" in r or "ceo" in r:
        return "executive"
    return "store_manager"

class UserCreateAdmin(BaseModel):
    name: str
    email: str
    role: Optional[str] = "Store Manager"
    store: Optional[str] = "All Stores"
    status: Optional[str] = "Active"
    password: Optional[str] = "retail123"

class UserUpdateAdmin(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    store: Optional[str] = None
    status: Optional[str] = None

@router.get("/users")
def list_users(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    users = db.query(User).all()
    results = []
    for u in users:
        role_label = u.role.name if u.role else "Store Manager"
        if role_label == "admin":
            role_label = "Administrator"
        elif role_label == "retail_analyst":
            role_label = "Retail Analyst"
        elif role_label == "marketing_manager":
            role_label = "Marketing Manager"
        elif role_label == "store_manager":
            role_label = "Store Manager"
        elif role_label == "executive":
            role_label = "Executive C-Suite"

        results.append({
            "id": u.id,
            "uid": f"USR-{str(u.id).zfill(3)}",
            "name": u.name,
            "email": u.email,
            "role": role_label,
            "store": u.store or "All Stores",
            "status": u.status or "Active",
        })
    return results

@router.post("/users")
def create_user_admin(payload: UserCreateAdmin, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    role_norm = normalize_role_name(payload.role)
    role_obj = db.query(Role).filter(Role.name == role_norm).first()
    if not role_obj:
        role_obj = Role(name=role_norm)
        db.add(role_obj)
        db.commit()
        db.refresh(role_obj)
        
    pwd = payload.password or "retail123"
    new_u = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(pwd),
        role_id=role_obj.id,
        status=payload.status or "Active",
        store=payload.store or "All Stores"
    )
    db.add(new_u)
    db.commit()
    db.refresh(new_u)
    return {
        "id": new_u.id,
        "uid": f"USR-{str(new_u.id).zfill(3)}",
        "name": new_u.name,
        "email": new_u.email,
        "role": payload.role,
        "store": new_u.store,
        "status": new_u.status
    }

@router.put("/users/{user_id}")
def update_user_admin(user_id: int, payload: UserUpdateAdmin, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    if payload.name is not None:
        u.name = payload.name
    if payload.email is not None:
        u.email = payload.email
    if payload.status is not None:
        u.status = payload.status
    if payload.store is not None:
        u.store = payload.store
    if payload.role is not None:
        role_norm = normalize_role_name(payload.role)
        role_obj = db.query(Role).filter(Role.name == role_norm).first()
        if not role_obj:
            role_obj = Role(name=role_norm)
            db.add(role_obj)
            db.commit()
            db.refresh(role_obj)
        u.role_id = role_obj.id
    db.commit()
    db.refresh(u)
    return {
        "id": u.id,
        "uid": f"USR-{str(u.id).zfill(3)}",
        "name": u.name,
        "email": u.email,
        "role": payload.role or (u.role.name if u.role else "Store Manager"),
        "store": u.store,
        "status": u.status
    }

@router.delete("/users/{user_id}")
def delete_user_admin(user_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(u)
    db.commit()
    return {"message": "User deleted", "id": user_id}

@router.get("/me")
def get_me(user=Depends(get_current_user)):
    return {"id": user.id, "name": user.name, "email": user.email, "role": user.role.name}