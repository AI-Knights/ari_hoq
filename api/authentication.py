from rest_framework_simplejwt.authentication import JWTAuthentication
from django.conf import settings

class CookieJWTAuthentication(JWTAuthentication):
    """
    Custom authentication class that allows reading the JWT from a cookie
    named 'access_token' if the 'Authorization' header is missing.
    """
    def authenticate(self, request):
        # First, try the default behavior (checks Authorization header)
        header = self.get_header(request)
        if header is not None:
            raw_token = self.get_raw_token(header)
            if raw_token is not None:
                validated_token = self.get_validated_token(raw_token)
                return self.get_user(validated_token), validated_token

        # If header is missing, try reading from the 'access_token' cookie
        raw_token = request.COOKIES.get('access_token')
        if raw_token:
            try:
                validated_token = self.get_validated_token(raw_token)
                return self.get_user(validated_token), validated_token
            except Exception:
                return None

        return None
