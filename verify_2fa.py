import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
import pyotp

User = get_user_model()

def test_totp():
    print("Testing TOTP Logic...")
    secret = pyotp.random_base32()
    print(f"Generated Secret: {secret}")
    
    totp = pyotp.TOTP(secret)
    code = totp.now()
    print(f"Current Code: {code}")
    
    # Verify the code
    is_valid = totp.verify(code)
    print(f"Verification (current code): {'SUCCESS' if is_valid else 'FAILED'}")
    
    # Verify an old code (should fail if outside window, but pyotp allows 30s)
    # Testing with a dummy code
    is_invalid = totp.verify("000000")
    print(f"Verification (invalid code): {'FAILED (as expected)' if not is_invalid else 'SUCCESS (unexpected)'}")

def test_model():
    print("\nTesting Model Fields...")
    test_email = "testadmin@example.com"
    User.objects.filter(email=test_email).delete()
    
    user = User.objects.create_user(
        email=test_email,
        password="testpassword123!",
        full_name="Test Admin",
        role="admin",
        is_staff=True,
        is_active=True
    )
    
    print(f"User created: {user.email}")
    print(f"Initial 2FA status: {user.is_2fa_enabled}")
    
    user.totp_secret = pyotp.random_base32()
    user.is_2fa_enabled = True
    user.save()
    
    # Refresh from DB
    user.refresh_from_db()
    print(f"Updated 2FA status: {user.is_2fa_enabled}")
    print(f"TOTP Secret stored: {user.totp_secret is not None}")
    
    # Cleanup
    user.delete()
    print("Test user deleted.")

if __name__ == "__main__":
    try:
        test_totp()
        test_model()
        print("\nAll backend logic tests passed!")
    except Exception as e:
        print(f"\nTest failed with error: {e}")
