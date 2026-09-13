#!/usr/bin/env python3
"""
OTP Dispatch Utility Script for RetailVision Consumer Attention Mapping System.
Sends 6-digit OTP codes to Email addresses and Phone numbers via SMTP, Twilio, or Fast2SMS.
Saves generated OTP codes directly to the database for seamless login and verification.

Usage:
  python send_otp.py --target eleanor@retail.com
  python send_otp.py --target +15550192834
  python send_otp.py --email eleanor@retail.com --phone +15550192834
  python send_otp.py --email eleanor@retail.com --code 123456
"""

import sys
import os
import random
import argparse
from datetime import datetime, timedelta, timezone

script_dir = os.path.dirname(os.path.abspath(__file__))
if script_dir not in sys.path:
    sys.path.insert(0, script_dir)

from app.db.session import SessionLocal, engine, Base
from app.models.domain import OTPCode
from app.services.otp_service import send_email_otp, send_sms_otp
from app.core.config import settings


def dispatch_otp(target: str, code: str = None, purpose: str = "authentication", channel: str = None) -> dict:
    target_clean = target.strip()
    if "@" in target_clean:
        target_clean = target_clean.lower()
        is_email = True
    else:
        is_email = channel == "email"

    if not code:
        code = f"{random.randint(100000, 999999)}"

    expires_at = datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(minutes=10)

    db_saved = False
    try:
        db = SessionLocal()
        db.query(OTPCode).filter(
            OTPCode.target == target_clean,
            OTPCode.is_used == False
        ).update({"is_used": True})

        otp_obj = OTPCode(
            target=target_clean,
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
        print(f"Notice: Database OTP record notice: {e}")

    if is_email:
        res = send_email_otp(target_clean, code)
        channel_name = "Email"
    else:
        res = send_sms_otp(target_clean, code)
        channel_name = "Phone SMS"

    return {
        "success": True,
        "target": target_clean,
        "channel": channel_name,
        "code": code,
        "expires_in_minutes": 10,
        "db_recorded": db_saved,
        "dispatch_detail": res
    }


def main():
    parser = argparse.ArgumentParser(description="Send 6-Digit OTP to Email Address and/or Phone Number")
    parser.add_argument("--target", "-t", type=str, help="Email address or phone number to send OTP to")
    parser.add_argument("--email", "-e", type=str, help="Email address")
    parser.add_argument("--phone", "-p", type=str, help="Phone number (e.g. +15550192834)")
    parser.add_argument("--code", "-c", type=str, help="Custom 6-digit OTP code (optional)")
    parser.add_argument("--purpose", type=str, default="authentication", help="Purpose of OTP (default: authentication)")

    args = parser.parse_args()

    targets = []
    if args.target:
        targets.append(args.target)
    if args.email and args.email not in targets:
        targets.append(args.email)
    if args.phone and args.phone not in targets:
        targets.append(args.phone)

    if not targets:
        print("Error: Please specify at least one target using --target, --email, or --phone.")
        sys.exit(1)

    print("=" * 65)
    print("       RETAILVISION AI - EMAIL & SMS OTP DISPATCH SERVICE       ")
    print("=" * 65)

    for tgt in targets:
        res = dispatch_otp(tgt, code=args.code, purpose=args.purpose)
        print(f"\n[+] Target Destination : {res['target']}")
        print(f"    Communication Type : {res['channel']}")
        print(f"    Generated OTP Code : {res['code']}  (Valid for 10 minutes)")
        print(f"    Recorded in DB     : {'YES' if res['db_recorded'] else 'NO'}")
        print(f"    Dispatch Status    : {res['dispatch_detail'].get('detail', 'Dispatched successfully')}")

    print("\n" + "=" * 65)
    print("OTP dispatch process completed successfully!")
    print("=" * 65)


if __name__ == "__main__":
    main()
