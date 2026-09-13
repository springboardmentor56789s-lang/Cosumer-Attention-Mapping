#!/usr/bin/env python3
"""
Dedicated Email OTP Dispatcher Script for RetailVision AI
Sends 6-digit OTP codes specifically to Email addresses via SMTP or simulated email service.
Saves generated OTP codes directly to SQLite DB for user verification.

Usage:
  python send_email_otp.py --email user@example.com
  python send_email_otp.py -e manager@retail.com --code 654321
"""

import sys
import os
import random
import argparse
from datetime import datetime, timedelta, timezone

# Ensure backend directory is in sys.path
script_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(script_dir, "backend") if os.path.exists(os.path.join(script_dir, "backend")) else script_dir
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

try:
    from app.db.session import SessionLocal
    from app.models.domain import OTPCode
    from app.services.email_otp_service import send_email_otp, validate_email_address
except ImportError:
    sys.path.insert(0, os.path.join(script_dir, "..", "backend"))
    from app.db.session import SessionLocal
    from app.models.domain import OTPCode
    from app.services.email_otp_service import send_email_otp, validate_email_address


def dispatch_email_otp(email: str, code: str = None, purpose: str = "authentication") -> dict:
    clean_email = email.strip().lower()
    if not validate_email_address(clean_email):
        return {"success": False, "error": f"Invalid email format: '{email}'"}

    if not code:
        code = f"{random.randint(100000, 999999)}"

    expires_at = datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(minutes=10)

    db_saved = False
    try:
        db = SessionLocal()
        # Invalidate previous unused OTPs for this email target
        db.query(OTPCode).filter(
            OTPCode.target == clean_email,
            OTPCode.is_used == False
        ).update({"is_used": True})

        otp_obj = OTPCode(
            target=clean_email,
            code=code,
            purpose=purpose,
            expires_at=expires_at,
            is_used=False
        )
        db.add(otp_obj)
        db.commit()
        db.close()
        db_saved = True
    except Exception as e:
        print(f"Notice: Database record error: {e}")

    dispatch_res = send_email_otp(clean_email, code)

    return {
        "success": dispatch_res.get("sent", True),
        "target": clean_email,
        "channel": "Email (SMTP)",
        "code": code,
        "expires_in_minutes": 10,
        "db_recorded": db_saved,
        "dispatch_detail": dispatch_res
    }


def main():
    parser = argparse.ArgumentParser(description="Send 6-Digit Verification OTP to Email Address")
    parser.add_argument("--email", "-e", type=str, required=True, help="Target recipient email address")
    parser.add_argument("--code", "-c", type=str, help="Custom 6-digit OTP code (optional)")
    parser.add_argument("--purpose", type=str, default="authentication", help="Purpose of OTP code")

    args = parser.parse_args()

    print("=" * 65)
    print("      RETAILVISION AI - EMAIL OTP DISPATCH SERVICE              ")
    print("=" * 65)

    res = dispatch_email_otp(args.email, code=args.code, purpose=args.purpose)

    if not res.get("success"):
        print(f"\n[X] ERROR: {res.get('error')}")
        sys.exit(1)

    print(f"\n[+] Target Email       : {res['target']}")
    print(f"    Channel            : {res['channel']}")
    print(f"    Generated OTP Code : {res['code']}  (Valid for 10 minutes)")
    print(f"    Recorded in DB     : {'YES' if res['db_recorded'] else 'NO'}")
    print(f"    Dispatch Status    : {res['dispatch_detail'].get('detail', 'Dispatched successfully')}")
    print("\n" + "=" * 65)
    print("Email OTP process finished!")
    print("=" * 65)


if __name__ == "__main__":
    main()
