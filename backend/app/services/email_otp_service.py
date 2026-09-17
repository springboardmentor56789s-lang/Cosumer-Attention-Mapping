import smtplib
import logging
import re
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

logger = logging.getLogger("email_otp_service")

EMAIL_REGEX = re.compile(r"^[\w\.-]+@[\w\.-]+\.\w+$")


def validate_email_address(email: str) -> bool:
    """
    Validates if the provided string is a valid email address.
    """
    if not email:
        return False
    return bool(EMAIL_REGEX.match(email.strip()))


def generate_email_otp_html(code: str, target_email: str) -> str:
    """
    Generates a dark-themed HTML email template containing the 6-digit OTP code.
    """
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>RetailVision AI Verification Code</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #f8fafc;">
        <div style="max-width: 600px; margin: 30px auto; background-color: #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); border: 1px solid #334155;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 30px 24px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 1px;">RetailVision AI</h1>
                <p style="margin: 8px 0 0 0; color: #93c5fd; font-size: 14px;">Consumer Attention Mapping & Analytics</p>
            </div>
            
            <!-- Content Body -->
            <div style="padding: 32px 24px; text-align: center;">
                <h2 style="margin-top: 0; color: #f8fafc; font-size: 20px;">Email Security Verification</h2>
                <p style="color: #94a3b8; font-size: 15px; line-height: 1.6;">
                    Hello,<br>
                    Use the 6-digit verification code below to authorize login or account verification for <strong>{target_email}</strong>.
                </p>
                
                <!-- OTP Code Display -->
                <div style="background-color: #0f172a; padding: 20px; border-radius: 12px; display: inline-block; margin: 24px 0; border: 1px solid #3b82f6;">
                    <span style="font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #22c55e; font-family: 'Courier New', Courier, monospace;">
                        {code}
                    </span>
                </div>
                
                <p style="color: #64748b; font-size: 13px; margin-bottom: 0;">
                    ⏰ This code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.
                </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #0f172a; padding: 16px 24px; text-align: center; border-top: 1px solid #334155;">
                <p style="margin: 0; color: #475569; font-size: 12px;">
                    © 2026 RetailVision AI System. All rights reserved.
                </p>
            </div>
        </div>
    </body>
    </html>
    """


def send_email_otp(target_email: str, code: str) -> dict:
    """
    Sends a 6-digit OTP code to a recipient email address using SMTP.
    Falls back to structured logger if SMTP credentials are absent.
    """
    clean_email = target_email.strip().lower()
    if not validate_email_address(clean_email):
        logger.warning(f"Invalid email address format: {target_email}")
        return {
            "sent": False,
            "method": "invalid_email",
            "detail": f"Provided email format '{target_email}' is invalid."
        }

    # Check if SMTP configuration is active
    if settings.SMTP_USER and settings.SMTP_PASSWORD:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = f"Your RetailVision AI Verification Code: {code}"
            msg["From"] = f"RetailVision AI <{settings.EMAILS_FROM_EMAIL}>"
            msg["To"] = clean_email

            html_body = generate_email_otp_html(code, clean_email)
            msg.attach(MIMEText(html_body, "html"))

            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.EMAILS_FROM_EMAIL, [clean_email], msg.as_string())

            logger.info(f"Successfully sent real Email OTP to {clean_email}")
            return {
                "sent": True,
                "method": "smtp",
                "target": clean_email,
                "detail": f"Real OTP email dispatched via SMTP to {clean_email}"
            }
        except Exception as e:
            logger.error(f"Failed to send email via SMTP: {e}")
            return {
                "sent": False,
                "method": "smtp_error",
                "target": clean_email,
                "detail": f"SMTP delivery failed: {str(e)}"
            }
    else:
        logger.info(f"[Email OTP Service] (Simulated Delivery) Verification OTP for {clean_email}: {code}")
        return {
            "sent": True,
            "method": "simulated_email_service",
            "target": clean_email,
            "detail": f"Simulated OTP dispatched to {clean_email}. (SMTP credentials omitted)"
        }
