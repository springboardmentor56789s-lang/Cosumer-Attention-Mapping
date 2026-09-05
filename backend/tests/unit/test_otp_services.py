import pytest
from app.services.email_otp_service import validate_email_address, send_email_otp, generate_email_otp_html
from app.services.sms_otp_service import validate_phone_number, format_and_clean_phone, send_sms_otp


def test_validate_email_address():
    assert validate_email_address("user@domain.com") is True
    assert validate_email_address("eleanor.manager@retailvision.ai") is True
    assert validate_email_address("invalid-email") is False
    assert validate_email_address("") is False


def test_send_email_otp_simulation():
    res = send_email_otp("test_user@retail.com", "123456")
    assert res["sent"] is True
    assert "target" in res
    assert res["target"] == "test_user@retail.com"


def test_generate_email_otp_html():
    html = generate_email_otp_html("654321", "test@domain.com")
    assert "654321" in html
    assert "test@domain.com" in html
    assert "RetailVision AI" in html


def test_format_and_clean_phone():
    assert format_and_clean_phone("+1 (555) 019-2834") == "+15550192834"
    assert format_and_clean_phone("9876543210") == "9876543210"
    assert format_and_clean_phone("+91 98765 43210") == "+919876543210"


def test_validate_phone_number():
    assert validate_phone_number("+15550192834") is True
    assert validate_phone_number("9876543210") is True
    assert validate_phone_number("123") is False
    assert validate_phone_number("") is False


def test_send_sms_otp_simulation():
    res = send_sms_otp("+15550192834", "999888")
    assert res["sent"] is True
    assert res["target"] == "+15550192834"
