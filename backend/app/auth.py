import os
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext


# ============================================================
# JWT CONFIGURATION
# ============================================================

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "SUPER_SECRET_GLASSMORPHISM_KEY_CHANGE_IN_PROD"
)

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480")
)


# ============================================================
# PASSWORD HASHING
# ============================================================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


def hash_password(password: str) -> str:
    """
    Hash a plain-text password.
    """
    return pwd_context.hash(password)


def get_password_hash(password: str) -> str:
    """
    Compatibility function for existing code.
    """
    return hash_password(password)


def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:
    """
    Verify a plain-text password against a hashed password.
    """
    return pwd_context.verify(
        plain_password,
        hashed_password
    )


# ============================================================
# CREATE ACCESS TOKEN
# ============================================================

def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a JWT access token.

    Example:

        create_access_token({
            "id": user.id,
            "email": user.email,
            "role": user.role
        })

    The user's email is automatically added as the
    JWT 'sub' claim because get_current_user()
    uses 'sub' to identify the user.
    """

    to_encode = data.copy()

    # --------------------------------------------------------
    # Add JWT subject
    # --------------------------------------------------------
    if "sub" not in to_encode:

        email = to_encode.get("email")

        if email:
            to_encode["sub"] = str(email)

    # --------------------------------------------------------
    # Make sure sub exists
    # --------------------------------------------------------
    if not to_encode.get("sub"):
        raise ValueError(
            "JWT token requires an email or sub value."
        )

    # --------------------------------------------------------
    # Expiration
    # --------------------------------------------------------
    if expires_delta is not None:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode["exp"] = expire

    # --------------------------------------------------------
    # Encode JWT
    # --------------------------------------------------------
    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


# ============================================================
# DECODE ACCESS TOKEN
# ============================================================

def decode_access_token(token: str) -> Optional[dict]:
    """
    Decode and validate an access token.

    Returns:
        Payload dictionary if valid.
        None if invalid or expired.
    """

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        return payload

    except JWTError:
        return None