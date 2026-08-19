from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from database.database import get_db
from app.auth import SECRET_KEY, ALGORITHM
from app import model


# ============================================================
# BEARER AUTHENTICATION
# ============================================================

security = HTTPBearer(auto_error=False)


# ============================================================
# CURRENT USER
# ============================================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> model.User:

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None:
        raise credentials_exception

    if credentials.scheme.lower() != "bearer":
        raise credentials_exception

    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        email = payload.get("sub")

        if not email:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = (
        db.query(model.User)
        .filter(model.User.email == email)
        .first()
    )

    if user is None:
        raise credentials_exception

    return user


# ============================================================
# ADMIN
# ============================================================

def require_admin(
    current_user: model.User = Depends(get_current_user),
) -> model.User:

    if current_user.role != model.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Admin role required for this action.",
        )

    return current_user


# ============================================================
# STORE MANAGER / ADMIN
# ============================================================

def require_store_manager(
    current_user: model.User = Depends(get_current_user),
) -> model.User:

    if current_user.role not in {
        model.UserRole.STORE_MANAGER,
        model.UserRole.ADMIN,
    }:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Store manager role required for this action.",
        )

    return current_user