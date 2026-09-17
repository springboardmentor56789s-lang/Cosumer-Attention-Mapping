import logging
import json
import re
import urllib.request
import urllib.parse
from app.core.config import settings

logger = logging.getLogger("sms_otp_service")


def format_and_clean_phone(phone: str) -> str:
    """
    Cleans and formats phone numbers to standard format.
    E.g., +1 (555) 019-2834 -> +15550192834
    """
    if not phone:
        return ""
    cleaned = phone.strip()
    # Retain leading + if exists
    has_plus = cleaned.startswith("+")
    digits_only = re.sub(r"[^\d]", "", cleaned)
    if has_plus:
        return f"+{digits_only}"
    return digits_only


def validate_phone_number(phone: str) -> bool:
    """
    Validates phone number length (between 7 and 15 digits).
    """
    cleaned = format_and_clean_phone(phone)
    digits = cleaned.replace("+", "")
    return 7 <= len(digits) <= 15


def send_sms_otp(target_phone: str, code: str) -> dict:
    """
    Sends a 6-digit OTP code to a recipient phone number via Twilio, Fast2SMS, or fallback logger.
    """
    formatted_phone = format_and_clean_phone(target_phone)
    if not validate_phone_number(formatted_phone):
        logger.warning(f"Invalid phone number format: {target_phone}")
        return {
            "sent": False,
            "method": "invalid_phone",
            "detail": f"Provided phone number format '{target_phone}' is invalid."
        }

    # 1. Twilio SMS Integration
    if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN:
        try:
            import base64
            url = f"https://api.twilio.com/2010-04-01/Accounts/{settings.TWILIO_ACCOUNT_SID}/Messages.json"
            auth_str = f"{settings.TWILIO_ACCOUNT_SID}:{settings.TWILIO_AUTH_TOKEN}"
            b64_auth = base64.b64encode(auth_str.encode("utf-8")).decode("utf-8")

            data = urllib.parse.urlencode({
                "To": formatted_phone,
                "From": settings.TWILIO_PHONE_NUMBER,
                "Body": f"Your RetailVision AI verification code is: {code}. Valid for 10 minutes."
            }).encode("utf-8")

            req = urllib.request.Request(url, data=data, headers={
                "Authorization": f"Basic {b64_auth}",
                "Content-Type": "application/x-www-form-urlencoded"
            })

            with urllib.request.urlopen(req, timeout=10) as resp:
                res_data = json.loads(resp.read().decode("utf-8"))
                logger.info(f"Twilio SMS dispatched successfully to {formatted_phone}")
                return {
                    "sent": True,
                    "method": "twilio",
                    "target": formatted_phone,
                    "detail": f"Real SMS dispatched via Twilio to {formatted_phone}"
                }
        except Exception as e:
            logger.error(f"Twilio SMS Error: {e}")
            return {
                "sent": False,
                "method": "twilio_error",
                "target": formatted_phone,
                "detail": f"Twilio SMS delivery failed: {str(e)}"
            }

    # 2. Fast2SMS Integration (India)
    elif settings.FAST2SMS_API_KEY:
        try:
            import urllib.error
            clean_num = formatted_phone.replace("+", "").replace(" ", "")
            key = settings.FAST2SMS_API_KEY.strip()

            # Try route=q (Quick SMS)
            params = urllib.parse.urlencode({
                "route": "q",
                "message": f"Your RetailVision AI OTP verification code is: {code}. Valid for 10 minutes.",
                "flash": "0",
                "numbers": clean_num
            })
            url = f"https://www.fast2sms.com/dev/bulkV2?{params}"
            req = urllib.request.Request(url, headers={
                "authorization": key,
                "User-Agent": "RetailVision-AI/2.0"
            })

            with urllib.request.urlopen(req, timeout=10) as resp:
                res_body = json.loads(resp.read().decode("utf-8"))
                if res_body.get("return") is True or res_body.get("status_code") == 200:
                    logger.info(f"Fast2SMS dispatched successfully to {formatted_phone}")
                    return {
                        "sent": True,
                        "method": "fast2sms",
                        "target": formatted_phone,
                        "detail": f"Real SMS dispatched via Fast2SMS to {formatted_phone}"
                    }
                else:
                    msg = res_body.get("message", "Fast2SMS dispatch failed.")
                    return {
                        "sent": False,
                        "method": "fast2sms_api_error",
                        "target": formatted_phone,
                        "detail": f"Fast2SMS Response: {msg}"
                    }
        except urllib.error.HTTPError as e:
            try:
                err_body = json.loads(e.read().decode("utf-8"))
                err_msg = err_body.get("message", str(e))
            except Exception:
                err_msg = str(e)
            logger.error(f"Fast2SMS HTTP Error: {err_msg}")
            return {
                "sent": False,
                "method": "fast2sms_error",
                "target": formatted_phone,
                "detail": f"Fast2SMS Gateway Notice: {err_msg}"
            }
        except Exception as e:
            logger.error(f"Fast2SMS Error: {e}")
            return {
                "sent": False,
                "method": "fast2sms_error",
                "target": formatted_phone,
                "detail": f"Fast2SMS Error: {str(e)}"
            }

    # 3. Fallback Simulated Delivery
    else:
        logger.info(f"[SMS OTP Service] (Simulated Delivery) Verification OTP for {formatted_phone}: {code}")
        return {
            "sent": True,
            "method": "simulated_sms_service",
            "target": formatted_phone,
            "detail": f"Simulated SMS OTP dispatched to {formatted_phone}. (Twilio/Fast2SMS credentials omitted)"
        }
