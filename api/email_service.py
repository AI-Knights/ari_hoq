"""Email service — sends OTP and welcome emails in background threads (rb-woodroff pattern)"""

import threading
import random
import string
from django.core.mail import send_mail
from django.conf import settings


def _generate_otp():
    return ''.join(random.choices(string.digits, k=6))


def _send_in_thread(subject, plain_message, recipient_list, html_message=None):
    """Fire-and-forget email sending to avoid blocking the request."""
    def _task():
        try:
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=recipient_list,
                html_message=html_message,
                fail_silently=False,
            )
        except Exception as e:
            print(f"[EmailService] Failed to send email to {recipient_list}: {e}")

    threading.Thread(target=_task, daemon=True).start()


def send_otp_email(user):
    """Generate and send OTP to user (async). Returns the OTP instance."""
    from .models import OTP

    otp_code = _generate_otp()
    otp_instance = OTP.objects.create(user=user, otp=otp_code)
    duration = getattr(settings, 'OTP_VALIDITY_DURATION', 15)

    name = user.full_name or user.username or user.email
    subject = "QuranPartners — Your Verification Code"

    plain = (
        f"As-Salamu Alaykum {name},\n\n"
        f"Your verification code is: {otp_code}\n\n"
        f"This code expires in {duration} minutes.\n\n"
        f"If you did not request this, please ignore this email.\n\n"
        f"— The QuranPartners Team"
    )

    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;
                background:#0A1A3A;border-radius:12px;color:#fff;">
        <h2 style="color:#D4AF37;font-family:serif;margin:0 0 16px;">QuranPartners</h2>
        <p>As-Salamu Alaykum <strong>{name}</strong>,</p>
        <p>Your email verification code is:</p>
        <div style="text-align:center;margin:24px 0;">
            <span style="font-size:40px;font-weight:bold;letter-spacing:12px;color:#D4AF37;">
                {otp_code}
            </span>
        </div>
        <p style="color:#9ca3af;font-size:13px;">
            Expires in {duration} minutes. If you did not request this, ignore this email.
        </p>
        <hr style="border-color:#1e3a5f;margin:24px 0;">
        <p style="color:#9ca3af;font-size:12px;">— The QuranPartners Team</p>
    </div>
    """

    _send_in_thread(subject, plain, [user.email], html_message=html)
    return otp_instance


def send_welcome_email(user):
    """Send welcome email after successful verification (async)."""
    name = user.full_name or user.username or user.email
    subject = "Welcome to QuranPartners!"

    plain = (
        f"As-Salamu Alaykum {name},\n\n"
        f"Welcome to QuranPartners! Your account is now active.\n\n"
        f"Start finding your perfect Quran memorization partner today.\n\n"
        f"— The QuranPartners Team"
    )

    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;
                background:#0A1A3A;border-radius:12px;color:#fff;">
        <h2 style="color:#D4AF37;font-family:serif;margin:0 0 16px;">Welcome to QuranPartners!</h2>
        <p>As-Salamu Alaykum <strong>{name}</strong>,</p>
        <p>Your account is now verified and active. 🎉</p>
        <p>You can now find memorization partners, track your Hifz progress, and connect with 
           the global Muslim community.</p>
        <hr style="border-color:#1e3a5f;margin:24px 0;">
        <p style="color:#9ca3af;font-size:12px;">— The QuranPartners Team</p>
    </div>
    """

    _send_in_thread(subject, plain, [user.email], html_message=html)
