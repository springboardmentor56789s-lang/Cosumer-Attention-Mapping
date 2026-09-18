from passlib.context import CryptContext
from jose import JWTError, jwt
from fastapi import HTTPException
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os


# =========================================================
# LOAD ENVIRONMENT VARIABLES
# =========================================================

load_dotenv()


# =========================================================
# PASSWORD HASHING
# =========================================================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


# =========================================================
# JWT SETTINGS
# =========================================================

SECRET_KEY = os.getenv("SECRET_KEY")

ALGORITHM = os.getenv(
    "ALGORITHM",
    "HS256"
)

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv(
        "ACCESS_TOKEN_EXPIRE_MINUTES",
        "60"
    )
)


# =========================================================
# CHECK JWT CONFIGURATION
# =========================================================

if not SECRET_KEY:

    raise RuntimeError(
        "SECRET_KEY is missing from the .env file"
    )


print("\n========== JWT CONFIGURATION ==========")

print(
    "SECRET_KEY loaded:",
    bool(SECRET_KEY)
)

print(
    "ALGORITHM:",
    ALGORITHM
)

print(
    "TOKEN EXPIRATION:",
    ACCESS_TOKEN_EXPIRE_MINUTES,
    "minutes"
)

print(
    "=======================================\n"
)


# =========================================================
# HASH PASSWORD
# =========================================================

def hash_password(password: str):

    return pwd_context.hash(
        password
    )


# =========================================================
# VERIFY PASSWORD
# =========================================================

def verify_password(
    plain_password: str,
    hashed_password: str
):

    return pwd_context.verify(
        plain_password,
        hashed_password
    )


# =========================================================
# CREATE JWT TOKEN
# =========================================================

def create_access_token(
    data: dict
):

    to_encode = data.copy()

    expire = (
        datetime.utcnow()
        +
        timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )

    to_encode.update(
        {
            "exp": expire
        }
    )

    token = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return token


# =========================================================
# VERIFY JWT TOKEN
# =========================================================

def verify_token(
    token: str
):

    try:

        payload = jwt.decode(

            token,

            SECRET_KEY,

            algorithms=[
                ALGORITHM
            ]
        )

        # -------------------------------------------------
        # Get email from "sub"
        # -------------------------------------------------

        email = payload.get(
            "sub"
        )

        if email is None:

            print(
                "JWT ERROR: 'sub' missing from token"
            )

            raise HTTPException(
                status_code=401,
                detail="Invalid token payload"
            )

        # -------------------------------------------------
        # Check expiration
        # -------------------------------------------------

        expiration = payload.get(
            "exp"
        )

        if expiration:

            current_timestamp = (
                datetime.utcnow().timestamp()
            )

            if current_timestamp > expiration:

                print(
                    "JWT ERROR: Token expired"
                )

                raise HTTPException(
                    status_code=401,
                    detail="Token expired"
                )

        print(
            "JWT verification successful for:",
            email
        )

        return email

    except HTTPException:

        raise

    except JWTError as e:

        print(
            "JWT ERROR:",
            str(e)
        )

        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    except Exception as e:

        print(
            "Unexpected JWT ERROR:",
            str(e)
        )

        raise HTTPException(
            status_code=401,
            detail="Could not validate token"
        )