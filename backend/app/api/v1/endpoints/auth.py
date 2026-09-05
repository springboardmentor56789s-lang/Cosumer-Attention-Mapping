import random
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.domain import User, OTPCode
from app.schemas.schemas import (
    UserLogin, UserRegister, UserOut, Token,
    SendOTPRequest, SendOTPResponse, VerifyOTPRequest, VerifyOTPResponse, OTPLoginRequest
)
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.config import settings

router = APIRouter()

@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email.strip().lower()).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user account")

    if user_in.expected_role:
        is_manager_role = user.role in ["Store Manager", "Admin", "Manager", "Retail Analyst", "Marketing Manager"]
        is_worker_role = user.role in ["Worker", "Store Staff"]
        if user_in.expected_role == "Manager" and not is_manager_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. This account is registered as a {user.role}, not a Manager."
            )
        elif user_in.expected_role == "Worker" and not is_worker_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. This account is registered as a {user.role}, not a Worker."
            )
    
    access_token = create_access_token(subject=user.email, role=user.role)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

from app.services.otp_service import send_email_otp, send_sms_otp

@router.post("/send-otp", response_model=SendOTPResponse)
def send_otp(req: SendOTPRequest, db: Session = Depends(get_db)):
    target_clean = req.target.strip().lower() if "@" in req.target else req.target.strip()
    if not target_clean:
        raise HTTPException(status_code=400, detail="Email or phone number is required")

    # Generate 6-digit OTP code
    code = f"{random.randint(100000, 999999)}"
    expires_at = datetime.utcnow() + timedelta(minutes=10)

    # Invalidate previous unused OTPs for this target
    db.query(OTPCode).filter(
        OTPCode.target == target_clean,
        OTPCode.is_used == False
    ).update({"is_used": True})

    otp_obj = OTPCode(
        target=target_clean,
        code=code,
        purpose=req.purpose or "authentication",
        expires_at=expires_at,
        is_used=False
    )
    db.add(otp_obj)
    db.commit()

    is_email = "@" in target_clean or req.channel == "email"
    channel_name = "Email" if is_email else "Phone SMS"

    # Dispatch via Email / SMS Service
    if is_email:
        dispatch_res = send_email_otp(target_clean, code)
    else:
        dispatch_res = send_sms_otp(target_clean, code)

    msg = f"Verification OTP code sent to {channel_name}: {target_clean}. Please check your inbox or SMS messages."

    return SendOTPResponse(
        message=msg,
        target=target_clean,
        demo_otp=None,
        expires_in_seconds=600
    )


@router.post("/verify-otp", response_model=VerifyOTPResponse)
def verify_otp(req: VerifyOTPRequest, db: Session = Depends(get_db)):
    target_clean = req.target.strip().lower() if "@" in req.target else req.target.strip()
    
    otp_entry = db.query(OTPCode).filter(
        OTPCode.target == target_clean,
        OTPCode.code == req.code.strip(),
        OTPCode.is_used == False,
        OTPCode.expires_at > datetime.utcnow()
    ).order_by(OTPCode.created_at.desc()).first()

    if not otp_entry:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP verification code")

    otp_entry.is_used = True

    # Mark user verification if user exists
    user = db.query(User).filter(
        (User.email == target_clean) | (User.phone == target_clean)
    ).first()

    if user:
        if "@" in target_clean:
            user.is_email_verified = True
        else:
            user.is_phone_verified = True

    db.commit()

    return VerifyOTPResponse(
        message="OTP code verified successfully!",
        verified=True,
        target=target_clean
    )

@router.post("/login-otp", response_model=Token)
def login_otp(req: OTPLoginRequest, db: Session = Depends(get_db)):
    target_clean = req.target.strip().lower() if "@" in req.target else req.target.strip()

    otp_entry = db.query(OTPCode).filter(
        OTPCode.target == target_clean,
        OTPCode.code == req.code.strip(),
        OTPCode.is_used == False,
        OTPCode.expires_at > datetime.utcnow()
    ).order_by(OTPCode.created_at.desc()).first()

    if not otp_entry:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP code")

    otp_entry.is_used = True

    user = db.query(User).filter(
        (User.email == target_clean) | (User.phone == target_clean)
    ).first()

    if not user:
        raise HTTPException(status_code=404, detail="No registered account found with this email or phone number.")

    if req.expected_role:
        is_manager_role = user.role in ["Store Manager", "Admin", "Manager", "Retail Analyst", "Marketing Manager"]
        is_worker_role = user.role in ["Worker", "Store Staff"]
        if req.expected_role == "Manager" and not is_manager_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Account is registered as {user.role}, not Manager."
            )
        elif req.expected_role == "Worker" and not is_worker_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Account is registered as {user.role}, not Worker."
            )

    if "@" in target_clean:
        user.is_email_verified = True
    else:
        user.is_phone_verified = True

    db.commit()
    db.refresh(user)

    access_token = create_access_token(subject=user.email, role=user.role)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/register", response_model=UserOut)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pwd = get_password_hash(user_in.password)
    new_user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=hashed_pwd,
        phone=user_in.phone,
        is_email_verified=True,
        is_phone_verified=bool(user_in.phone),
        role=user_in.role or "Store Manager"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/logout")
def logout():
    return {"message": "Successfully logged out"}

