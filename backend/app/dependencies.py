from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.auth import verify_token
from app.database import database


# =========================================================
# OAuth2 Configuration
# =========================================================

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/login"
)


# =========================================================
# Get Current Logged-in User
# =========================================================

async def get_current_user(
    token: str = Depends(oauth2_scheme)
):

    print("\n========== AUTH DEBUG ==========")

    # -----------------------------------------------------
    # Check whether token was received
    # -----------------------------------------------------

    if not token:

        print("Token received: False")
        print("================================\n")

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token missing",
            headers={
                "WWW-Authenticate": "Bearer"
            }
        )

    print("Token received: True")
    print(
        "Token preview:",
        token[:30] + "..."
    )


    # -----------------------------------------------------
    # Verify JWT
    # -----------------------------------------------------

    try:

        email = verify_token(
            token
        )

        print(
            "Verified email:",
            email
        )

    except HTTPException as e:

        print(
            "JWT verification failed:",
            e.detail
        )

        print(
            "================================\n"
        )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={
                "WWW-Authenticate": "Bearer"
            }
        )

    except Exception as e:

        print(
            "Unexpected token error:",
            str(e)
        )

        print(
            "================================\n"
        )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={
                "WWW-Authenticate": "Bearer"
            }
        )


    # -----------------------------------------------------
    # Check email from token
    # -----------------------------------------------------

    if not email:

        print(
            "Email missing from token"
        )

        print(
            "================================\n"
        )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={
                "WWW-Authenticate": "Bearer"
            }
        )


    # -----------------------------------------------------
    # Find user in MongoDB
    # -----------------------------------------------------

    try:

        user = await database.users.find_one(
            {
                "email": email
            }
        )

    except Exception as e:

        print(
            "Database error while finding user:",
            str(e)
        )

        print(
            "================================\n"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to verify user"
        )


    # -----------------------------------------------------
    # User does not exist
    # -----------------------------------------------------

    if user is None:

        print(
            "User found: False"
        )

        print(
            "================================\n"
        )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={
                "WWW-Authenticate": "Bearer"
            }
        )


    # -----------------------------------------------------
    # Success
    # -----------------------------------------------------

    print(
        "User found: True"
    )

    print(
        "================================\n"
    )

    return user