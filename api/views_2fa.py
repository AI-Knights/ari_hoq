from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.throttling import ScopedRateThrottle
import pyotp
import qrcode
import base64
from io import BytesIO

class Enable2FAAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        if user.is_2fa_enabled:
            return Response({'detail': '2FA is already enabled.'}, status=status.HTTP_400_BAD_REQUEST)
        
        secret = pyotp.random_base32()
        totp = pyotp.TOTP(secret)
        provisioning_url = totp.provisioning_uri(name=user.email, issuer_name="QuranPartners")
        
        img = qrcode.make(provisioning_url)
        buffer = BytesIO()
        img.save(buffer, format="PNG")
        qr_data = base64.b64encode(buffer.getvalue()).decode()
        
        return Response({
            'qr_data': f"data:image/png;base64,{qr_data}",
            'secret': secret
        })

class Setup2FAAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        secret = request.data.get('secret')
        code = request.data.get('code')
        
        if not secret or not code:
            return Response({'detail': 'Secret and code are required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        totp = pyotp.TOTP(secret)
        if totp.verify(code):
            user.totp_secret = secret
            user.is_2fa_enabled = True
            user.save()
            return Response({'detail': '2FA enabled successfully.', 'is_2fa_enabled': True})
        else:
            return Response({'detail': 'Invalid verification code.'}, status=status.HTTP_400_BAD_REQUEST)

class Disable2FAAPIView(APIView):
    """
    Disable 2FA for the authenticated user.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        user.is_2fa_enabled = False
        user.totp_secret = None
        user.save()

        return Response({"message": "2FA has been disabled."}, status=status.HTTP_200_OK)


class Verify2FALoginAPIView(APIView):
    """
    Step 2 of Login: Verify the 6-digit TOTP code using the short-lived 2fa_token.
    If valid, issues the actual HTTP-only access and refresh cookies.
    """
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = '2fa_verify'

    def post(self, request):
        import jwt
        from django.contrib.auth import get_user_model
        from django.conf import settings as djsettings
        from api.views import _set_auth_cookies, CustomRefreshToken
        from api.serializers import UserSerializer
        
        User = get_user_model()
        
        two_fa_token = request.data.get('two_fa_token')
        code = request.data.get('code')

        if not two_fa_token or not code:
            return Response({'error': 'two_fa_token and code are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            payload = jwt.decode(two_fa_token, djsettings.SECRET_KEY, algorithms=['HS256'])
            if payload.get('purpose') != '2fa_login':
                raise ValueError("Wrong purpose")
            user = User.objects.get(id=payload['user_id'], is_active=True)
        except Exception:
            return Response({'error': 'Invalid or expired 2FA token.'}, status=status.HTTP_400_BAD_REQUEST)

        if not user.totp_secret:
            return Response({'error': '2FA is not set up for this user.'}, status=status.HTTP_400_BAD_REQUEST)

        totp = pyotp.TOTP(user.totp_secret)
        if not totp.verify(code):
            return Response({'error': 'Invalid 2FA code.'}, status=status.HTTP_400_BAD_REQUEST)

        # Success! Issue the real JWT cookies
        refresh = CustomRefreshToken.for_user(user)
        response = Response({
            'message': '2FA verification successful.',
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)
        
        _set_auth_cookies(response, str(refresh.access_token), str(refresh))
        return response
