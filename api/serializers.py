from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate

User = get_user_model()


# ---------------------------------------------------------------------------
# User Serializers
# ---------------------------------------------------------------------------

class MinimalUserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'avatar', 'level', 'role', 'status']

    def get_name(self, obj):
        return obj.full_name or obj.username or obj.email

    def get_avatar(self, obj):
        if obj.avatar:
            return obj.avatar.url
        return None

    def get_status(self, obj):
        from django.utils import timezone
        import datetime
        from django.db.models import Q
        from .models import Block
        
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # Hide status if there's a block in either direction
            if Block.objects.filter(
                Q(blocker=request.user, blocked=obj) | Q(blocker=obj, blocked=request.user)
            ).exists():
                return 'offline'

        if not obj.last_active:
            return 'offline'
        if timezone.now() - obj.last_active < datetime.timedelta(minutes=3):
            return 'online'
        return 'offline'


class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()
    availability = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'name', 'username', 'full_name', 'avatar', 'role',
            'level', 'bio', 'location', 'timezone', 'primary_language', 'gender',
            'memorized_surahs_count', 'current_streak', 'is_suspended',
            'warnings_count', 'date_joined', 'last_active', 'availability'
        ]
        read_only_fields = ['id', 'email', 'date_joined', 'last_active']

    def get_name(self, obj):
        return obj.full_name or obj.username or obj.email

    def get_avatar(self, obj):
        if obj.avatar:
            try:
                if hasattr(obj.avatar, 'url'):
                    return obj.avatar.url
                return str(obj.avatar)
            except Exception:
                pass
        return None

    def get_availability(self, obj):
        slots = obj.availability.all()
        return AvailabilitySerializer(slots, many=True).data


# ---------------------------------------------------------------------------
# Auth Serializers
# ---------------------------------------------------------------------------

class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    full_name = serializers.CharField(max_length=100, required=False, default='')
    username = serializers.CharField(max_length=50, required=False, default='')

    def validate_password(self, value):
        from django.contrib.auth.password_validation import validate_password
        validate_password(value)
        return value

    def validate_email(self, value):
        value = value.lower().strip()
        existing = User.objects.filter(email=value, is_active=True).first()
        if existing:
            raise serializers.ValidationError("An account with this email already exists.")
        return value


class OTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)

    def validate(self, data):
        from .models import OTP
        try:
            user = User.objects.get(email=data['email'], is_active=False)
        except User.DoesNotExist:
            raise serializers.ValidationError("No pending verification for this email.")

        try:
            otp_instance = user.otps.filter(otp=data['otp']).latest('created_at')
        except OTP.DoesNotExist:
            raise serializers.ValidationError("Invalid verification code.")

        if not otp_instance.is_valid():
            raise serializers.ValidationError("Verification code has expired. Please sign up again.")

        data['user'] = user
        data['otp_instance'] = otp_instance
        return data


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError("Invalid email or password.")
        if not user.is_active:
            raise serializers.ValidationError("Account not verified. Please check your email.")
        data['user'] = user
        return data


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True, min_length=8)

    def validate_old_password(self, value):
        if not self.context['request'].user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value

    def validate_new_password(self, value):
        from django.contrib.auth.password_validation import validate_password
        validate_password(value)
        return value

    def validate(self, data):
        if data['old_password'] == data['new_password']:
            raise serializers.ValidationError("New password must differ from the old one.")
        return data


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value.lower(), is_active=True).exists():
            raise serializers.ValidationError("No active account found with this email.")
        return value.lower()


# ---------------------------------------------------------------------------
# Feature Serializers
# ---------------------------------------------------------------------------

from .models import HifzProgress, PartnerPreference, Availability, Friendship, PartnerRequest, Message, Report


class HifzProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = HifzProgress
        fields = ['id', 'surah_number', 'status', 'completed_ayahs', 'last_reviewed', 'notes']
        read_only_fields = ['id', 'last_reviewed']


class PartnerPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = PartnerPreference
        fields = ['id', 'level', 'preferred_language', 'timezone', 'goals', 'gender_pref', 'is_available', 'updated_at']
        read_only_fields = ['id', 'updated_at']


class AvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Availability
        fields = ['id', 'day_of_week', 'time_slot']
        read_only_fields = ['id']


class FriendshipSerializer(serializers.ModelSerializer):
    user1 = MinimalUserSerializer(read_only=True)
    user2 = MinimalUserSerializer(read_only=True)

    class Meta:
        model = Friendship
        fields = ['id', 'user1', 'user2', 'status', 'message', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class PartnerRequestSerializer(serializers.ModelSerializer):
    requester = MinimalUserSerializer(read_only=True)
    recipient = MinimalUserSerializer(read_only=True)

    class Meta:
        model = PartnerRequest
        fields = ['id', 'requester', 'recipient', 'message', 'status', 'created_at']
        read_only_fields = ['id', 'created_at']


class MessageSerializer(serializers.ModelSerializer):
    sender = MinimalUserSerializer(read_only=True)
    recipient = MinimalUserSerializer(read_only=True)
    recipient_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='recipient', write_only=True
    )

    class Meta:
        model = Message
        fields = ['id', 'sender', 'recipient', 'recipient_id', 'content', 'timestamp', 'is_read']
        read_only_fields = ['id', 'timestamp']


class ReportSerializer(serializers.ModelSerializer):
    reporter = MinimalUserSerializer(read_only=True)
    reported_user = MinimalUserSerializer(read_only=True)
    resolved_by = MinimalUserSerializer(read_only=True)

    class Meta:
        model = Report
        fields = [
            'id', 'reporter', 'reported_user', 'reason', 'report_type',
            'severity', 'status', 'created_at', 'resolved_at', 'resolved_by',
        ]
        read_only_fields = ['id', 'created_at', 'resolved_at', 'resolved_by']



