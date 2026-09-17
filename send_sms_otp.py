#!/usr/bin/env python3
"""
Dedicated SMS / Phone Number OTP Dispatcher Script for RetailVision AI
Sends 6-digit OTP codes specifically to Phone Numbers via Twilio, Fast2SMS, or SMS Logger.
Saves generated OTP codes directly to SQLite DB for user verification.

Usage:
  python send_sms_otp.py --phone +15550192834
  python send_sms_otp.py -p +919876543210 --code 123456
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
    from app.services.sms_otp_service import send_sms_otp, validate_phone_number, format_and_clean_phone
except ImportError:
    sys.path.insert(0, os.path.join(script_dir, "..", "backend"))
    from app.db.session import SessionLocal
    from app.models.domain import OTPCode
    from app.services.sms_otp_service import send_sms_otp, validate_phone_number, format_and_clean_phone


def dispatch_phone_otp(phone: str, code: str = None, purpose: str = "authentication") -> dict:
    formatted_phone = format_and_clean_phone(phone)
    if not validate_phone_number(formatted_phone):
        return {"success": False, "error": f"Invalid phone number format: '{phone}'"}

    if not code:
        code = f"{random.randint(100000, 999999)}"

    expires_at = datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(minutes=10)

    db_saved = False
    try:
        db = SessionLocal()
        # Invalidate previous unused OTPs for this phone target
        db.query(OTPCode).filter(
            OTPCode.target == formatted_phone,
            OTPCode.is_used == False
        ).update({"is_used": True})

        otp_obj = OTPCode(
            target=formatted_phone,
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

    dispatch_res = send_sms_otp(formatted_phone, code)

    return {
        "success": True,
        "target": formatted_phone,
        "channel": "Phone SMS (Fast2SMS / Twilio)",
        "code": code,
        "expires_in_minutes": 10,
        "db_recorded": db_saved,
        "dispatch_detail": dispatch_res
    }


def main():
    parser = argparse.ArgumentParser(description="Send 6-Digit Verification OTP to Phone Number")
    parser.add_argument("--phone", "-p", type=str, required=True, help="Target recipient phone number (e.g. +15550192834)")
    parser.add_argument("--code", "-c", type=str, help="Custom 6-digit OTP code (optional)")
    parser.add_argument("--purpose", type=str, default="authentication", help="Purpose of OTP code")

    args = parser.parse_args()

    print("=" * 65)
    print("      RETAILVISION AI - PHONE SMS OTP DISPATCH SERVICE          ")
    print("=" * 65)

    res = dispatch_phone_otp(args.phone, code=args.code, purpose=args.purpose)

    if not res.get("success"):
        print(f"\n[X] ERROR: {res.get('error', 'Dispatch failed')}")
        sys.exit(1)

    print(f"\n[+] Target Phone       : {res['target']}")
    print(f"    Channel            : {res['channel']}")
    print(f"    Generated OTP Code : {res['code']}  (Valid for 10 minutes)")
    print(f"    Recorded in DB     : {'YES' if res['db_recorded'] else 'NO'}")
    
    dispatch_detail = res.get('dispatch_detail', {})
    if dispatch_detail.get('sent'):
        print(f"    Dispatch Status    : {dispatch_detail.get('detail', 'Dispatched successfully')}")
    else:
        print(f"    Dispatch Status    : Gateway Notice: {dispatch_detail.get('detail', 'Pending provider activation')}")
        print("    Note               : OTP Code is saved in DB and ready for login verification.")

    print("\n" + "=" * 65)
    print("Phone SMS OTP process finished!")
    print("=" * 65)


if __name__ == "__main__":
    main()
