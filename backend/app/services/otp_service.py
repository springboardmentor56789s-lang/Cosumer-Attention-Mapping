"""
OTP Service Module for RetailVision AI
Integrates modular Email OTP and SMS Phone OTP dispatch services.
"""

from app.services.email_otp_service import send_email_otp, validate_email_address, generate_email_otp_html
from app.services.sms_otp_service import send_sms_otp, format_and_clean_phone, validate_phone_number

__all__ = [
    "send_email_otp",
    "validate_email_address",
    "generate_email_otp_html",
    "send_sms_otp",
    "format_and_clean_phone",
    "validate_phone_number"
]
