"""
Authentication and API views — rb-woodroff CBV pattern.
Uses get_user_model(), CustomRefreshToken, OTP via email_service.
"""

from rest_framework import generics, status, permissions, filters, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.utils import timezone

from .tokens import CustomRefreshToken
from .email_service import send_otp_email, send_welcome_email
from .models import OTP, HifzProgress, PartnerPreference, Availability, Friendship, PartnerRequest, Message, Report
from .serializers import (
    UserSerializer, MinimalUserSerializer,
    RegisterSerializer, OTPVerifySerializer, LoginSerializer,
    ChangePasswordSerializer, PasswordResetRequestSerializer,
    HifzProgressSerializer, PartnerPreferenceSerializer, AvailabilitySerializer,
    FriendshipSerializer, PartnerRequestSerializer, MessageSerializer, ReportSerializer,
)

User = get_user_model()


# ---------------------------------------------------------------------------
# Auth Views — CBV style (rb-woodroff pattern)
# ---------------------------------------------------------------------------

class RegisterView(generics.CreateAPIView):
    """Step 1: Create inactive user + send OTP email."""
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        full_name = serializer.validated_data.get('full_name', '')
        username = serializer.validated_data.get('username', '') or email.split('@')[0]

        # Recycle inactive user or create fresh
        user = User.objects.filter(email=email, is_active=False).first()
        if user:
            user.full_name = full_name
            user.username = username
            user.set_password(password)
            user.save()
            user.otps.all().delete()
        else:
            # Ensure unique username
            base = username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base}{counter}"
                counter += 1
            user = User.objects.create_user(
                email=email, password=password,
                full_name=full_name, username=username,
                is_active=False,
            )

        try:
            send_otp_email(user)
        except Exception as e:
            user.delete()
            return Response({'error': f'Failed to send verification email: {e}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
            'message': 'Registration successful. Please check your email for the verification code.',
            'email': user.email,
        }, status=status.HTTP_201_CREATED)


class VerifyOTPView(APIView):
    """Step 2: Verify OTP, activate account, return JWT tokens."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user']
        otp_instance = serializer.validated_data['otp_instance']

        # Activate
        user.is_active = True
        user.save()
        otp_instance.delete()

        # Welcome email (async)
        try:
            send_welcome_email(user)
        except Exception:
            pass

        refresh = CustomRefreshToken.for_user(user)
        return Response({
            'message': 'Email verified. Welcome to QuranPartners!',
            'email': user.email,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        }, status=status.HTTP_200_OK)


class SendOTPView(APIView):
    """Resend OTP to user's email."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        if not email:
            return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        user.otps.all().delete()

        try:
            send_otp_email(user)
            return Response({'message': 'Verification code sent.'})
        except Exception as e:
            return Response({'error': 'Failed to send email.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        refresh = CustomRefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        })


class LogoutView(APIView):
    """Blacklist the refresh token on logout."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'message': 'Logged out successfully.'})
        except Exception:
            return Response({'error': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        user = request.user
        
        if 'avatar' in request.data and request.data['avatar'] and user.avatar:
            try:
                import cloudinary.uploader
                cloudinary.uploader.destroy(user.avatar.public_id)
            except Exception:
                pass # Fail silently if the image was already deleted or doesn't exist

        for field in ['full_name', 'username', 'avatar', 'level', 'bio', 'location', 'timezone', 'primary_language', 'gender']:
            if field in request.data:
                setattr(user, field, request.data[field])
        user.save()
        user.last_active = timezone.now()
        user.save(update_fields=['last_active'])
        return Response(UserSerializer(user).data)


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response({'message': 'Password changed successfully.'})


class DeleteAccountView(APIView):
    """Delete user account - requires password confirmation."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        password = request.data.get('password')
        if not password:
            return Response({'error': 'Password is required to delete account.'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user
        if not user.check_password(password):
            return Response({'error': 'Incorrect password.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Delete the user account
        user.delete()
        return Response({'message': 'Account deleted successfully.'}, status=status.HTTP_200_OK)


class PasswordResetRequestView(APIView):
    """Step 1: Send reset OTP."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        import jwt
        from datetime import timedelta
        from django.conf import settings as djsettings

        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        user = User.objects.get(email=email, is_active=True)

        user.otps.all().delete()

        try:
            send_otp_email(user)
            payload = {
                'user_id': str(user.id),
                'purpose': 'password_reset',
                'exp': timezone.now() + timedelta(minutes=15),
                'iat': timezone.now(),
            }
            reset_token = jwt.encode(payload, djsettings.SECRET_KEY, algorithm='HS256')
            return Response({'message': 'Reset code sent to your email.', 'reset_token': reset_token})
        except Exception as e:
            return Response({'error': 'Failed to send reset email.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SetNewPasswordView(APIView):
    """Step 2: Verify OTP + new password using reset_token."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        import jwt, hashlib
        from django.conf import settings as djsettings

        reset_token = request.data.get('reset_token')
        otp_code = request.data.get('otp')
        new_password = request.data.get('new_password')

        if not all([reset_token, otp_code, new_password]):
            return Response({'error': 'reset_token, otp, and new_password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            payload = jwt.decode(reset_token, djsettings.SECRET_KEY, algorithms=['HS256'])
            if payload.get('purpose') != 'password_reset':
                raise ValueError("Wrong purpose")
            user = User.objects.get(id=payload['user_id'], is_active=True)
        except Exception:
            return Response({'error': 'Invalid or expired reset token.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            otp_instance = user.otps.filter(otp=otp_code).latest('created_at')
            if not otp_instance.is_valid():
                return Response({'error': 'OTP has expired.'}, status=status.HTTP_400_BAD_REQUEST)
        except OTP.DoesNotExist:
            return Response({'error': 'Invalid OTP.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        user.otps.all().delete()
        return Response({'message': 'Password reset successful. You can now log in.'})


# ---------------------------------------------------------------------------
# Me View
# ---------------------------------------------------------------------------

class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


# ---------------------------------------------------------------------------
# Dashboard
# ---------------------------------------------------------------------------

class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        from datetime import timedelta

        completed_count = HifzProgress.objects.filter(user=user, status='mastered').count()

        friendships = Friendship.objects.filter(
            Q(user1=user) | Q(user2=user), status='accepted'
        ).select_related('user1', 'user2').order_by('-updated_at')[:5]

        recent_matches = []
        for f in friendships:
            partner = f.user2 if f.user1 == user else f.user1
            recent_matches.append(MinimalUserSerializer(partner).data)

        # Use same 3-minute threshold as get_status() in serializers for consistency
        three_min_ago = timezone.now() - timedelta(minutes=3)
        online_count = User.objects.filter(last_active__gte=three_min_ago, is_active=True).count()

        user.memorized_surahs_count = completed_count
        user.last_active = timezone.now()
        user.save(update_fields=['memorized_surahs_count', 'last_active'])
        
        # Update streak on dashboard visit (daily login counts as activity)
        user.update_streak()

        return Response({
            'streak': user.current_streak,
            'completed_surahs': completed_count,
            'total_surahs': 114,
            'online_count': max(online_count, 1),
            'recent_matches': recent_matches,
        })


# ---------------------------------------------------------------------------
# Partner Matching
# ---------------------------------------------------------------------------

class MatchView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        level = request.data.get('level', '')
        language = request.data.get('language', '')
        timezone_pref = request.data.get('timezone', '')
        goals = request.data.get('goals', '')

        pref, _ = PartnerPreference.objects.get_or_create(user=request.user)
        pref.level = level
        pref.preferred_language = language
        pref.timezone = timezone_pref
        pref.goals = goals
        pref.save()

        # Exclude self, existing friends, pending requests, declined matches, and blocks
        existing = Friendship.objects.filter(
            Q(user1=request.user) | Q(user2=request.user),
            status__in=['accepted', 'pending', 'declined']   # now also excluding declined
        ).values_list('user1_id', 'user2_id')
        excluded = {request.user.id}
        for u1, u2 in existing:
            excluded.add(u1)
            excluded.add(u2)

        from .models import Block
        blocks = Block.objects.filter(Q(blocker=request.user) | Q(blocked=request.user))
        for b in blocks:
            excluded.add(b.blocker_id)
            excluded.add(b.blocked_id)

        candidates = User.objects.exclude(id__in=excluded).filter(
            is_active=True, is_suspended=False
        )

        best, best_score = None, -1
        for c in candidates:
            score = 10
            if level and c.level == level:
                score += 40
            if language and language.lower() in (c.primary_language or '').lower():
                score += 30
            if timezone_pref and timezone_pref[:3].lower() in (c.timezone or '').lower():
                score += 20
            if score > best_score:
                best_score, best = score, c

        if not best:
            return Response({'match': None, 'message': 'No compatible partners found.'})

        compat = min(int((best_score / 100) * 100), 99)
        data = UserSerializer(best).data
        data['compatibility'] = compat
        return Response({'match': data})


class SkipMatchView(APIView):
    """Record that a user declined/skipped a suggested match"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({'error': 'user_id required'}, status=status.HTTP_400_BAD_REQUEST)
        
        target = User.objects.filter(id=user_id).first()
        if not target:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if friendship already exists
        existing = Friendship.objects.filter(
            Q(user1=request.user, user2=target) | Q(user1=target, user2=request.user)
        ).first()
        
        if existing:
            # If already exists, just update to declined
            existing.status = 'declined'
            existing.save()
        else:
            # Create new friendship with declined status
            Friendship.objects.create(
                user1=request.user,
                user2=target,
                status='declined',
                message='Skipped during matching'
            )
        
        return Response({'status': 'skipped'})


# ---------------------------------------------------------------------------
# Admin
# ---------------------------------------------------------------------------

def is_admin_or_mod(user):
    return user.role in ['admin', 'moderator']


def is_admin(user):
    return user.role == 'admin'


class AdminStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not is_admin_or_mod(request.user):
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        today = timezone.now().date()
        from datetime import timedelta
        
        # User activity breakdown
        now = timezone.now()
        last_hour = now - timedelta(hours=1)
        last_day = now - timedelta(days=1)
        last_week = now - timedelta(days=7)
        
        active_last_hour = User.objects.filter(last_active__gte=last_hour, is_active=True).count()
        active_last_day = User.objects.filter(last_active__gte=last_day, is_active=True).count()
        active_last_week = User.objects.filter(last_active__gte=last_week, is_active=True).count()
        total_users = User.objects.filter(is_active=True).count()
        inactive_users = total_users - active_last_week
        
        # Hifz progress distribution - optimized single query
        from django.db.models import Count, Case, When, IntegerField, Q
        from django.db.models.functions import Cast
        
        # Annotate each user with their mastered count, then calculate percentage
        users_with_progress = User.objects.filter(is_active=True).annotate(
            mastered_count=Count(
                'hifz_progress',
                filter=Q(hifz_progress__status='mastered'),
                distinct=True
            )
        ).annotate(
            progress_percentage=Cast('mastered_count', IntegerField()) * 100 / 114
        ).aggregate(
            range_0_25=Count('id', filter=Q(progress_percentage__lte=25)),
            range_26_50=Count('id', filter=Q(progress_percentage__gt=25, progress_percentage__lte=50)),
            range_51_75=Count('id', filter=Q(progress_percentage__gt=50, progress_percentage__lte=75)),
            range_76_100=Count('id', filter=Q(progress_percentage__gt=75))
        )
        
        progress_ranges = {
            '0-25': users_with_progress['range_0_25'] or 0,
            '26-50': users_with_progress['range_26_50'] or 0,
            '51-75': users_with_progress['range_51_75'] or 0,
            '76-100': users_with_progress['range_76_100'] or 0,
        }
        
        # Recent registrations (last 7 days)
        recent_signups = User.objects.filter(
            date_joined__gte=last_week, 
            is_active=True
        ).count()
        
        # Friendship activity
        recent_friendships = Friendship.objects.filter(
            created_at__gte=last_week,
            status='accepted'
        ).count()
        
        return Response({
            'total_users': total_users,
            'active_reports': Report.objects.filter(status='pending').count(),
            'suspended_users': User.objects.filter(is_suspended=True).count(),
            'messages_today': Message.objects.filter(timestamp__date=today).count(),
            'user_activity': {
                'last_hour': active_last_hour,
                'last_day': active_last_day,
                'last_week': active_last_week,
                'inactive': inactive_users,
            },
            'hifz_distribution': progress_ranges,
            'recent_signups': recent_signups,
            'recent_friendships': recent_friendships,
        })


class AdminBanUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, user_id):
        if not is_admin_or_mod(request.user):
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        try:
            target = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        target.is_suspended = not target.is_suspended
        target.save(update_fields=['is_suspended'])
        word = 'suspended' if target.is_suspended else 'unsuspended'
        return Response({'status': f'User {word}', 'is_suspended': target.is_suspended})


class AdminChangeRoleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, user_id):
        if not is_admin(request.user):
            return Response({'error': 'Only admins can change roles'}, status=status.HTTP_403_FORBIDDEN)
        try:
            target = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        new_role = request.data.get('role')
        if new_role not in ['user', 'moderator', 'admin']:
            return Response({'error': 'Invalid role'}, status=status.HTTP_400_BAD_REQUEST)
        target.role = new_role
        target.save(update_fields=['role'])
        return Response({'status': f'Role updated to {new_role}'})


class AdminUsersListView(APIView):
    """Admin-only endpoint: lists ALL platform users with full profile data."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not is_admin_or_mod(request.user):
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        qs = User.objects.filter(is_active=True)
        search = request.query_params.get('search', '').strip()
        if search:
            from django.db.models import Q
            qs = qs.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(full_name__icontains=search)
            )
        serializer = UserSerializer(qs, many=True)
        return Response(serializer.data)


# ---------------------------------------------------------------------------
# ViewSets
# ---------------------------------------------------------------------------

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'email', 'full_name', 'level', 'location']

    def get_queryset(self):
        """
        For listing/searching: exclude blocked users
        For individual retrieval: allow viewing (needed for reporting, verification)
        """
        u = self.request.user
        
        # If this is a detail view (retrieve), don't filter blocks
        if self.action == 'retrieve':
            return User.objects.filter(is_active=True)
        
        # For list/search: exclude blocks
        excluded = set()
        from .models import Block
        from django.db.models import Q
        blocks = Block.objects.filter(Q(blocker=u) | Q(blocked=u))
        for b in blocks:
            excluded.add(b.blocker_id)
            excluded.add(b.blocked_id)
        return User.objects.filter(is_active=True).exclude(id__in=excluded)

    def retrieve(self, request, *args, **kwargs):
        """Allow viewing blocked user profiles (needed for context when reporting)"""
        return super().retrieve(request, *args, **kwargs)


class HifzProgressViewSet(viewsets.ModelViewSet):
    serializer_class = HifzProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return HifzProgress.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        qs = self.get_queryset()
        return Response({
            'total_completed': qs.filter(status='mastered').count(),
            'memorizing': qs.filter(status='memorizing').count(),
            'reviewing': qs.filter(status='reviewing').count(),
        })

    @action(detail=False, methods=['post'])
    def toggle(self, request):
        surah_number = request.data.get('surah_number')
        if not surah_number:
            return Response({'error': 'surah_number required'}, status=status.HTTP_400_BAD_REQUEST)
        progress, created = HifzProgress.objects.get_or_create(
            user=request.user, surah_number=surah_number,
            defaults={'status': 'mastered'}
        )
        if not created:
            progress.status = 'not_started' if progress.status == 'mastered' else 'mastered'
            progress.save()
        
        count = HifzProgress.objects.filter(user=request.user, status='mastered').count()
        request.user.memorized_surahs_count = count
        request.user.save(update_fields=['memorized_surahs_count'])
        
        # Update streak when user makes progress
        request.user.update_streak()
        
        return Response(HifzProgressSerializer(progress).data)


class PartnerPreferenceViewSet(viewsets.ModelViewSet):
    serializer_class = PartnerPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PartnerPreference.objects.filter(user=self.request.user)

    def get_object(self):
        obj, _ = PartnerPreference.objects.get_or_create(user=self.request.user)
        return obj

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AvailabilityViewSet(viewsets.ModelViewSet):
    serializer_class = AvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return Availability.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'])
    def toggle(self, request):
        day_of_week = request.data.get('day_of_week')
        time_slot = request.data.get('time_slot')
        
        if not day_of_week or not time_slot:
            return Response({'error': 'Missing day_of_week or time_slot'}, status=status.HTTP_400_BAD_REQUEST)
            
        slot = Availability.objects.filter(user=request.user, day_of_week=day_of_week, time_slot=time_slot).first()
        if slot:
            slot.delete()
        else:
            Availability.objects.create(user=request.user, day_of_week=day_of_week, time_slot=time_slot)
            
        return Response(AvailabilitySerializer(self.get_queryset(), many=True).data)


class FriendshipViewSet(viewsets.ModelViewSet):
    serializer_class = FriendshipSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        u = self.request.user
        return Friendship.objects.filter(Q(user1=u) | Q(user2=u)).select_related('user1', 'user2')

    @action(detail=False, methods=['post'], url_path='request')
    def send_request(self, request):
        username = request.data.get('username')
        user_id = request.data.get('user_id')
        message = request.data.get('message', '').strip()

        if not message:
            return Response({'error': 'An introductory message is required to send a friend request.'}, status=status.HTTP_400_BAD_REQUEST)
        if len(message) > 150:
            return Response({'error': 'Message must be 150 characters or less.'}, status=status.HTTP_400_BAD_REQUEST)

        if user_id:
            target = User.objects.filter(id=user_id, is_active=True).first()
        elif username:
            target = User.objects.filter(username=username, is_active=True).first()
        else:
            return Response({'error': 'username or user_id required'}, status=status.HTTP_400_BAD_REQUEST)
        if not target:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        if target == request.user:
            return Response({'error': 'Cannot send request to yourself'}, status=status.HTTP_400_BAD_REQUEST)
        if Friendship.objects.filter(
            Q(user1=request.user, user2=target) | Q(user1=target, user2=request.user)
        ).exists():
            return Response({'error': 'Connection already exists'}, status=status.HTTP_400_BAD_REQUEST)
        f = Friendship.objects.create(user1=request.user, user2=target, status='pending', message=message)
        return Response(FriendshipSerializer(f).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        f = self.get_object()
        if f.user2 != request.user:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        f.status = 'accepted'
        f.save()
        return Response(FriendshipSerializer(f).data)

    @action(detail=True, methods=['post'])
    def decline(self, request, pk=None):
        f = self.get_object()
        if f.user2 != request.user:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        f.status = 'declined'
        f.save()
        return Response({'status': 'declined'})

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        f = self.get_object()
        if f.user1 != request.user:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        if f.status != 'pending':
            return Response({'error': 'Can only cancel pending requests'}, status=status.HTTP_400_BAD_REQUEST)
        f.delete()
        return Response({'status': 'cancelled'}, status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['post'])
    def unfriend(self, request):
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({'error': 'user_id required'}, status=status.HTTP_400_BAD_REQUEST)
        
        target = User.objects.filter(id=user_id).first()
        if not target:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        from django.db.models import Q
        deleted, _ = Friendship.objects.filter(
            Q(user1=request.user, user2=target) | Q(user1=target, user2=request.user),
            status='accepted'
        ).delete()

        if deleted:
            return Response({'status': 'unfriended'})
        return Response({'error': 'Not friends'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def block(self, request):
        """Block a user without creating a report"""
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({'error': 'user_id required'}, status=status.HTTP_400_BAD_REQUEST)
        
        target = User.objects.filter(id=user_id).first()
        if not target:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        if target == request.user:
            return Response({'error': 'Cannot block yourself'}, status=status.HTTP_400_BAD_REQUEST)

        from django.db.models import Q
        from .models import Block
        # Delete any existing friendship
        Friendship.objects.filter(
            Q(user1=request.user, user2=target) | Q(user1=target, user2=request.user)
        ).delete()

        Block.objects.get_or_create(blocker=request.user, blocked=target)
        
        return Response({'status': 'blocked'})
    
    @action(detail=False, methods=['post'])
    def report_and_block(self, request):
        """Report a user and optionally block them"""
        user_id = request.data.get('user_id')
        reason = request.data.get('reason', '').strip()
        report_type = request.data.get('report_type', 'other')
        severity = request.data.get('severity', 'medium')
        block_user = request.data.get('block_user', True)
        
        if not user_id:
            return Response({'error': 'user_id required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not reason:
            return Response({'error': 'reason required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if len(reason) > 500:
            return Response({'error': 'Reason must be 500 characters or less'}, status=status.HTTP_400_BAD_REQUEST)
        
        target = User.objects.filter(id=user_id).first()
        if not target:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        if target == request.user:
            return Response({'error': 'Cannot report yourself'}, status=status.HTTP_400_BAD_REQUEST)

        from django.db.models import Q
        from .models import Block, Report
        
        # Create the report
        report = Report.objects.create(
            reporter=request.user,
            reported_user=target,
            reason=reason,
            report_type=report_type,
            severity=severity,
            status='pending'
        )
        
        # Optionally block the user
        if block_user:
            # Delete any existing friendship
            Friendship.objects.filter(
                Q(user1=request.user, user2=target) | Q(user1=target, user2=request.user)
            ).delete()
            
            Block.objects.get_or_create(blocker=request.user, blocked=target)
        
        return Response({
            'status': 'reported',
            'blocked': block_user,
            'report_id': report.id
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def list_blocked(self, request):
        from .models import Block
        from .serializers import MinimalUserSerializer
        blocks = Block.objects.filter(blocker=request.user).select_related('blocked')
        blocked_users = [b.blocked for b in blocks]
        return Response(MinimalUserSerializer(blocked_users, many=True).data)

    @action(detail=False, methods=['post'])
    def unblock(self, request):
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({'error': 'user_id required'}, status=status.HTTP_400_BAD_REQUEST)
        
        from .models import Block
        deleted, _ = Block.objects.filter(blocker=request.user, blocked_id=user_id).delete()
        if deleted:
            return Response({'status': 'unblocked'})
        return Response({'error': 'Not blocked'}, status=status.HTTP_400_BAD_REQUEST)

class PartnerRequestViewSet(viewsets.ModelViewSet):
    serializer_class = PartnerRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        u = self.request.user
        return PartnerRequest.objects.filter(Q(requester=u) | Q(recipient=u)).select_related('requester', 'recipient')

    def perform_create(self, serializer):
        serializer.save(requester=self.request.user)

    @action(detail=True, methods=['post'])
    def respond(self, request, pk=None):
        obj = self.get_object()
        if obj.recipient != request.user:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        s = request.data.get('status')
        if s not in ['accepted', 'declined']:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        obj.status = s
        obj.save()
        return Response({'status': f'Request {s}'})


class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        u = self.request.user
        return Message.objects.filter(Q(sender=u) | Q(recipient=u)).select_related('sender', 'recipient')

    def create(self, request, *args, **kwargs):
        """Block messages to non-friends or if blocked."""
        recipient_id = request.data.get('recipient_id')
        if recipient_id:
            from .models import Block, Friendship
            is_friend = Friendship.objects.filter(
                Q(user1=request.user, user2_id=recipient_id) |
                Q(user1_id=recipient_id, user2=request.user),
                status='accepted'
            ).exists()
            
            is_blocked = Block.objects.filter(
                Q(blocker=request.user, blocked_id=recipient_id) |
                Q(blocker_id=recipient_id, blocked=request.user)
            ).exists()
            
            if not is_friend or is_blocked:
                return Response(
                    {'error': 'You can only message friends, and not if blocked.'},
                    status=status.HTTP_403_FORBIDDEN
                )
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

    @action(detail=False, methods=['post'])
    def delete_chat(self, request):
        user_id = request.data.get('user_id')
        for_both = request.data.get('for_both', False)
        
        from .models import DeletedChat, Message
        target = User.objects.filter(id=user_id).first()
        if not target:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        from django.utils import timezone
        
        if for_both:
            # Refinement: Only delete messages that the requester can currently see.
            # If they previously did "Only for me", messages prior to that 'deleted_at' are already hidden.
            my_deleted_record = DeletedChat.objects.filter(user=request.user, partner=target).first()
            
            msgs = Message.objects.filter(
                Q(sender=request.user, recipient=target) | 
                Q(sender=target, recipient=request.user)
            )
            
            if my_deleted_record:
                # Only delete messages sent AFTER their last virtual deletion
                msgs = msgs.filter(timestamp__gt=my_deleted_record.deleted_at)
            
            msgs.delete()
            
            # Reset my virtual deletion record since I just cleared everything I could see
            if my_deleted_record:
                my_deleted_record.delete()
                
            msg = 'Visible chat cleared for both users'
        else:
            # Classic "Only for me" — hide messages from current user's view
            DeletedChat.objects.update_or_create(
                user=request.user, partner=target,
                defaults={'deleted_at': timezone.now()}
            )
            msg = 'Chat deleted for you'
            
        return Response({'status': msg})

    @action(detail=False, methods=['get'])
    def conversation(self, request):
        other_id = request.query_params.get('user_id')
        limit = int(request.query_params.get('limit', 50))
        offset = int(request.query_params.get('offset', 0))
        
        if not other_id:
            return Response({'error': 'user_id param required'}, status=status.HTTP_400_BAD_REQUEST)
        u = request.user
        
        from .models import DeletedChat
        deleted_chat = DeletedChat.objects.filter(user=u, partner_id=other_id).first()
        
        # Mark all unread messages from this partner as read
        msgs_to_mark = Message.objects.filter(sender_id=other_id, recipient=u, is_read=False)
        updated_ids = list(msgs_to_mark.values_list('id', flat=True))
        
        if updated_ids:
            msgs_to_mark.update(is_read=True)
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync
            channel_layer = get_channel_layer()
            
            # Send ONE batched update instead of individual ones
            async_to_sync(channel_layer.group_send)(
                f"inbox_{other_id}",
                {
                    'type': 'message_read_update',
                    'message_ids': updated_ids,  # Note the 's'
                    'reader_id': str(u.id),      # Ensure string
                    'partner_id': str(u.id)
                }
            )

        msgs = Message.objects.filter(
            Q(sender=u, recipient_id=other_id) | Q(sender_id=other_id, recipient=u)
        )
        if deleted_chat:
            msgs = msgs.filter(timestamp__gt=deleted_chat.deleted_at)
            
        # Fetch newest first, slice, then reverse to chronological order
        msgs = msgs.order_by('-timestamp').select_related('sender', 'recipient')[offset:offset+limit]
        msgs_list = list(reversed(msgs))
        
        return Response(self.get_serializer(msgs_list, many=True).data)

    @action(detail=False, methods=['get'])
    def threads(self, request):
        u = request.user
        seen = {}
        
        # Include all accepted friends as default threads
        from .models import Friendship
        friendships = Friendship.objects.filter(Q(user1=u) | Q(user2=u), status='accepted').select_related('user1', 'user2')
        for f in friendships:
            partner = f.user2 if f.user1 == u else f.user1
            seen[partner.id] = {
                'partner': MinimalUserSerializer(partner).data,
                'last_message': 'You are now friends! Say hi.',
                'last_message_sender_id': None,
                'timestamp': f.updated_at,
                'unread': 0
            }

        from .models import DeletedChat
        deleted_chats = {dc.partner_id: dc.deleted_at for dc in DeletedChat.objects.filter(user=u)}

        all_msgs = self.get_queryset().order_by('-timestamp')
        for msg in all_msgs:
            partner = msg.recipient if msg.sender == u else msg.sender
            
            # Skip if message was sent before user deleted the chat
            deleted_time = deleted_chats.get(partner.id)
            if deleted_time and msg.timestamp <= deleted_time:
                continue
                
            if partner.id not in seen or seen[partner.id]['last_message'] == 'You are now friends! Say hi.':
                
                # Recalculate unread messages making sure to omit deleted messages
                unread_query = Message.objects.filter(sender=partner, recipient=u, is_read=False)
                if deleted_time:
                    unread_query = unread_query.filter(timestamp__gt=deleted_time)
                
                seen[partner.id] = {
                    'partner': MinimalUserSerializer(partner).data,
                    'last_message': msg.content,
                    'last_message_sender_id': msg.sender.id,
                    'timestamp': msg.timestamp,
                    'unread': unread_query.count(),
                }
        
        # Sort by timestamp descending
        sorted_threads = sorted(seen.values(), key=lambda x: x['timestamp'], reverse=True)
        return Response(sorted_threads)


class ReportViewSet(viewsets.ModelViewSet):
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if is_admin_or_mod(self.request.user):
            return Report.objects.all().select_related('reporter', 'reported_user', 'resolved_by')
        return Report.objects.filter(reporter=self.request.user)

    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)

    @action(detail=False, methods=['get'])
    def pending(self, request):
        if not is_admin_or_mod(request.user):
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        qs = self.get_queryset().filter(status='pending').order_by('-created_at')
        return Response(self.get_serializer(qs, many=True).data)

    def _resolve(self, request, pk, new_status):
        if not is_admin_or_mod(request.user):
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        r = self.get_object()
        r.status = new_status
        r.resolved_at = timezone.now()
        r.resolved_by = request.user
        r.save()
        return Response(ReportSerializer(r).data)

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        return self._resolve(request, pk, 'resolved')

    @action(detail=True, methods=['post'])
    def dismiss(self, request, pk=None):
        return self._resolve(request, pk, 'dismissed')

    @action(detail=True, methods=['post'])
    def warn(self, request, pk=None):
        if not is_admin_or_mod(request.user):
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        r = self.get_object()
        target = r.reported_user
        target.warnings_count += 1
        target.save(update_fields=['warnings_count'])
        r.status = 'resolved'
        r.resolved_at = timezone.now()
        r.resolved_by = request.user
        r.save()
        return Response({'status': 'User warned', 'warnings_count': target.warnings_count})

# ---------------------------------------------------------------------------
# WebRTC / Agora Token
# ---------------------------------------------------------------------------

import time
import uuid
from django.conf import settings
from agora_token_builder import RtcTokenBuilder
from .models import VideoCall

class AgoraTokenView(APIView):
    """
    POST /api/video/token/
    Accepts channel_name and returns an Agora RTC token if the user is a participant.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        channel_name = request.data.get('channel_name')
        if not channel_name:
            return Response({'error': 'channel_name is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate that the user is a participant in the call
        call = VideoCall.objects.filter(
            Q(channel_name=channel_name) & 
            (Q(initiator=request.user) | Q(receiver=request.user))
        ).first()

        if not call:
            return Response({'error': 'Unauthorized or invalid channel'}, status=status.HTTP_403_FORBIDDEN)

        app_id = getattr(settings, 'AGORA_APP_ID', None)
        app_certificate = getattr(settings, 'AGORA_APP_CERTIFICATE', None)
        
        if not app_id or not app_certificate:
            return Response({'error': 'Agora credentials are not configured'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Build token with uid 0 (allows Agora to assign or just connects)
        expiration_time_in_seconds = 3600
        current_time_stamp = int(time.time())
        privilege_expired_ts = current_time_stamp + expiration_time_in_seconds
        role = 1 # Role_Publisher

        token = RtcTokenBuilder.buildTokenWithUid(
            app_id, 
            app_certificate, 
            channel_name, 
            0,         # uid=0 → Agora grants access to any UID
            role, 
            privilege_expired_ts
        )
        
        return Response({
            'token': token, 
            'uid': 0, 
            'channel_name': channel_name,
            'app_id': app_id
        })


class CallInitiateView(APIView):
    """
    POST /api/video/call/initiate/
    Accepts receiver_id, creates a VideoCall record, and optionally signals via WS.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        receiver_id = request.data.get('receiver_id')
        channel_name = request.data.get('channel_name')
        
        if not receiver_id:
            return Response({'error': 'receiver_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            receiver = User.objects.get(id=receiver_id)
        except User.DoesNotExist:
            return Response({'error': 'Receiver not found'}, status=status.HTTP_404_NOT_FOUND)

        # Use provided deterministic channel name, otherwise fallback to UUID
        call_channel = channel_name if channel_name else str(uuid.uuid4())

        # If call exists and is pending/active, reuse it
        call = VideoCall.objects.filter(channel_name=call_channel).first()
        if not call:
            call = VideoCall.objects.create(
                initiator=request.user,
                receiver=receiver,
                channel_name=call_channel,
                status='pending'
            )
        else:
            # Re-activating a dropped/retry call
            call.status = 'pending'
            call.save()

        # Send WebSocket notification to the receiver
        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync
        channel_layer = get_channel_layer()
        
        async_to_sync(channel_layer.group_send)(
            f"inbox_{receiver.id}",
            {
                'type': 'call_signal',
                'signal_type': 'incoming_call',
                'sender_id': str(request.user.id),
                'channel_name': call.channel_name,
                'caller_info': MinimalUserSerializer(request.user).data
            }
        )

        return Response({
            'channel_name': call.channel_name,
            'call_id': call.id
        }, status=status.HTTP_201_CREATED)


class CallAcceptView(APIView):
    """
    POST /api/video/call/accept/
    Accepts channel_name and updates status to active.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        channel_name = request.data.get('channel_name')
        call = VideoCall.objects.filter(channel_name=channel_name, receiver=request.user).first()
        
        if not call:
            return Response({'error': 'Call not found'}, status=status.HTTP_404_NOT_FOUND)
            
        call.status = 'active'
        call.save()
        
        return Response({'status': 'active'})


class CallEndView(APIView):
    """
    POST /api/video/call/end/
    Accepts channel_name and optional status. Updates call status.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        channel_name = request.data.get('channel_name')
        new_status = request.data.get('status', 'ended') # can be missed, rejected, etc.
        
        call = VideoCall.objects.filter(
            Q(channel_name=channel_name) & 
            (Q(initiator=request.user) | Q(receiver=request.user))
        ).first()
        
        if not call:
            return Response({'error': 'Call not found'}, status=status.HTTP_404_NOT_FOUND)
            
        call.status = new_status
        call.save()
        
        return Response({'status': new_status})
