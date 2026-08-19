from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.database import get_db
from app.model import Store, User
from app.schema import LoginUser
from app.auth import verify_password, create_access_token

router = APIRouter(
    prefix="/api",
    tags=["Login"]
)


@router.post("/auth/login")
def login_with_auth_alias(user: LoginUser, db: Session = Depends(get_db)):
    return login(user, db)


def _ensure_seed_data(db: Session) -> None:
    if db.query(Store).count() == 0:
        store = Store(
            store_name="Northwind Retail",
            location="Main Street",
            manager_name="Alicia Nguyen",
            total_shelves=3,
            total_cameras=1,
            is_live_store=True,
        )
        db.add(store)
        db.flush()
    db.commit()

@router.post("/login")
def login(user: LoginUser, db: Session = Depends(get_db)):

    db_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email"
        )

    if not verify_password(user.password, db_user.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid password"
        )

    _ensure_seed_data(db)

    token = create_access_token(
        {
            "sub": db_user.email,
            "role": db_user.role
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": db_user.role.value,
        "full_name": db_user.full_name
    }
