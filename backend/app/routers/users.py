from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm

from app.database import database
from app.schemas import UserCreate
from app.auth import (
    hash_password,
    verify_password,
    create_access_token
)
from app.dependencies import get_current_user


router = APIRouter()


# =========================================================
# REGISTER
# =========================================================

@router.post("/register")
async def register_user(user: UserCreate):

    try:

        # -------------------------------------------------
        # Check whether email already exists
        # -------------------------------------------------

        existing_user = await database.users.find_one(
            {
                "email": user.email
            }
        )

        if existing_user:

            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )


        # -------------------------------------------------
        # Create user data
        # -------------------------------------------------

        user_data = {
            "name": user.name,
            "email": user.email,
            "password": hash_password(user.password),
            "role": user.role
        }


        # -------------------------------------------------
        # Save user
        # -------------------------------------------------

        result = await database.users.insert_one(
            user_data
        )


        print("====================================")
        print("USER REGISTERED")
        print("Email:", user.email)
        print("User ID:", result.inserted_id)
        print("====================================")


        return {

            "message":
                "User registered successfully",

            "id":
                str(result.inserted_id)

        }


    except HTTPException:
        raise


    except Exception as e:

        print("REGISTER ERROR:", str(e))

        raise HTTPException(
            status_code=500,
            detail=f"Registration failed: {str(e)}"
        )


# =========================================================
# LOGIN
# =========================================================

@router.post("/login")
async def login_user(
    form_data: OAuth2PasswordRequestForm = Depends()
):

    try:

        print("\n====================================")
        print("LOGIN REQUEST")
        print("Email:", form_data.username)


        # -------------------------------------------------
        # Find user
        # -------------------------------------------------

        existing_user = await database.users.find_one(
            {
                "email": form_data.username
            }
        )


        print(
            "User found:",
            existing_user is not None
        )


        if existing_user is None:

            raise HTTPException(
                status_code=404,
                detail="User not found"
            )


        # -------------------------------------------------
        # Get stored password
        # -------------------------------------------------

        stored_password = existing_user.get(
            "password"
        )


        if not stored_password:

            raise HTTPException(
                status_code=500,
                detail="User password is missing"
            )


        # -------------------------------------------------
        # Verify password
        # -------------------------------------------------

        password_match = verify_password(
            form_data.password,
            stored_password
        )


        print(
            "Password Match:",
            password_match
        )


        if not password_match:

            raise HTTPException(
                status_code=401,
                detail="Incorrect password"
            )


        # -------------------------------------------------
        # Create JWT
        # -------------------------------------------------

        token = create_access_token(
            {
                "sub": existing_user["email"]
            }
        )


        print(
            "JWT Token Generated:",
            bool(token)
        )


        if not token:

            raise HTTPException(
                status_code=500,
                detail="Could not generate access token"
            )


        print("LOGIN SUCCESS")
        print("====================================\n")


        # -------------------------------------------------
        # IMPORTANT:
        # Frontend expects access_token
        # -------------------------------------------------

        return {

            "access_token":
                token,

            "token_type":
                "bearer",

            "user": {

                "name":
                    existing_user.get(
                        "name",
                        ""
                    ),

                "email":
                    existing_user.get(
                        "email",
                        ""
                    ),

                "role":
                    existing_user.get(
                        "role",
                        ""
                    )

            }

        }


    except HTTPException:
        raise


    except Exception as e:

        print("\n========== LOGIN ERROR ==========")
        print(str(e))
        print("=================================\n")

        raise HTTPException(
            status_code=500,
            detail=f"Login failed: {str(e)}"
        )


# =========================================================
# PROFILE
# =========================================================

@router.get("/profile")
async def get_profile(
    current_user=Depends(get_current_user)
):

    return {

        "name":
            current_user.get(
                "name",
                ""
            ),

        "email":
            current_user.get(
                "email",
                ""
            ),

        "role":
            current_user.get(
                "role",
                ""
            )

    }
# =========================================================
# ADMIN USER MANAGEMENT
# =========================================================

@router.get("/admin/users")
async def list_users_for_admin(
    current_user=Depends(get_current_user)
):
    role = str(current_user.get("role", "")).strip().lower()

    if role not in {"administrator", "admin"}:
        raise HTTPException(
            status_code=403,
            detail="Administrator access required."
        )

    users = []

    cursor = database.users.find(
        {},
        {
            "password": 0
        }
    ).sort("name", 1)

    async for user in cursor:
        users.append({
            "id": str(user.get("_id")),
            "name": user.get("name", ""),
            "email": user.get("email", ""),
            "role": user.get("role", "")
        })

    return users
