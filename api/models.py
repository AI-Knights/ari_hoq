"""
Custom user model following the rb-woodroff AbstractBaseUser pattern.
Email is the USERNAME_FIELD. UUID primary key. role stored on the user directly.
"""

from django.db import models
from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.utils import timezone as tz
from django.conf import settings
import uuid
from cloudinary.models import CloudinaryField



# ---------------------------------------------------------------------------
# Custom Manager
# ---------------------------------------------------------------------------

class CustomAccountManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)
        extra_fields.setdefault("role", "admin")

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, password, **extra_fields)


# ---------------------------------------------------------------------------
# User Model
# ---------------------------------------------------------------------------

class UserAccount(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('user', 'User'),
        ('moderator', 'Moderator'),
        ('admin', 'Admin'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=50, blank=True)
    full_name = models.CharField(max_length=100, blank=True)
    avatar = CloudinaryField('avatar', folder='quaran_memorization_partner', blank=True, null=True)

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')

    # Profile fields
    level = models.CharField(max_length=50, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=100, blank=True, null=True)
    timezone = models.CharField(max_length=100, blank=True, null=True)
    primary_language = models.CharField(max_length=100, blank=True, null=True)
    gender = models.CharField(max_length=10, blank=True, null=True)

    # Stats
    memorized_surahs_count = models.IntegerField(default=0)
    current_streak = models.IntegerField(default=0)
    last_streak_update = models.DateField(null=True, blank=True)  # Track last day streak was updated

    # Moderation
    is_suspended = models.BooleanField(default=False)
    warnings_count = models.IntegerField(default=0)

    # Auth flags
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=False)  # False until email verified
    date_joined = models.DateTimeField(default=tz.now)
    last_active = models.DateTimeField(auto_now=True)

    # 2FA for Admins
    totp_secret = models.CharField(max_length=32, null=True, blank=True)
    is_2fa_enabled = models.BooleanField(default=False)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]

    objects = CustomAccountManager()

    def __str__(self):
        return f"{self.full_name or self.username or self.email} <{self.email}>"

    def get_full_name(self):
        return self.full_name or self.username or self.email

    def get_short_name(self):
        return (self.full_name or self.username or self.email).split()[0]

    def update_streak(self):
        """
        Update user's activity streak.
        - If last update was yesterday: increment streak
        - If last update was today: no change
        - If last update was 2+ days ago: reset to 1
        - If never updated: set to 1
        """
        from django.utils import timezone
        today = timezone.now().date()
        
        if self.last_streak_update is None:
            # First time activity
            self.current_streak = 1
            self.last_streak_update = today
        elif self.last_streak_update == today:
            # Already updated today, no change
            pass
        elif self.last_streak_update == today - timezone.timedelta(days=1):
            # Updated yesterday, increment streak
            self.current_streak += 1
            self.last_streak_update = today
        else:
            # Streak broken (2+ days ago), reset
            self.current_streak = 1
            self.last_streak_update = today
        
        self.save(update_fields=['current_streak', 'last_streak_update'])

    class Meta:
        verbose_name = "User Account"
        verbose_name_plural = "User Accounts"
        ordering = ["-date_joined"]


# ---------------------------------------------------------------------------
# OTP (follows rb-woodroff pattern: ForeignKey, multiple per user)
# ---------------------------------------------------------------------------

class OTP(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    user = models.ForeignKey(UserAccount, on_delete=models.CASCADE, related_name='otps')
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_valid(self):
        duration = getattr(settings, 'OTP_VALIDITY_DURATION', 15)  # minutes
        return tz.now() <= self.created_at + tz.timedelta(minutes=duration)

    def __str__(self):
        return f"OTP({self.otp}) for {self.user.email} — {'valid' if self.is_valid() else 'expired'}"

    class Meta:
        verbose_name = "One-Time Password"
        verbose_name_plural = "One-Time Passwords"
        indexes = [
            models.Index(fields=['created_at']),
        ]


# ---------------------------------------------------------------------------
# Hifz Progress
# ---------------------------------------------------------------------------

class HifzProgress(models.Model):
    STATUS_CHOICES = (
        ('not_started', 'Not Started'),
        ('memorizing', 'Memorizing'),
        ('reviewing', 'Reviewing'),
        ('mastered', 'Mastered'),
    )

    user = models.ForeignKey(UserAccount, on_delete=models.CASCADE, related_name='hifz_progress')
    surah_number = models.IntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_started')
    completed_ayahs = models.IntegerField(default=0)
    last_reviewed = models.DateTimeField(auto_now=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ('user', 'surah_number')
        ordering = ['surah_number']
        verbose_name = "Hifz Progress"
        verbose_name_plural = "Hifz Progress"

    def __str__(self):
        return f"{self.user.get_short_name()} — Surah {self.surah_number} ({self.status})"


# ---------------------------------------------------------------------------
# Partner Preference
# ---------------------------------------------------------------------------

class PartnerPreference(models.Model):
    user = models.OneToOneField(UserAccount, on_delete=models.CASCADE, related_name='partner_preference')
    level = models.CharField(max_length=50, blank=True, null=True)
    preferred_language = models.CharField(max_length=100, blank=True, null=True)
    timezone = models.CharField(max_length=100, blank=True, null=True)
    goals = models.TextField(blank=True, null=True)
    gender_pref = models.CharField(max_length=20, default='same')
    is_available = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.get_short_name()}'s partner preference"

    class Meta:
        verbose_name = "Partner Preference"
        verbose_name_plural = "Partner Preferences"


# ---------------------------------------------------------------------------
# Availability
# ---------------------------------------------------------------------------

class Availability(models.Model):
    DAY_CHOICES = [
        ('Mon', 'Monday'), ('Tue', 'Tuesday'), ('Wed', 'Wednesday'),
        ('Thu', 'Thursday'), ('Fri', 'Friday'), ('Sat', 'Saturday'), ('Sun', 'Sunday'),
    ]
    SLOT_CHOICES = [
        ('Morning', 'Morning'),
        ('Afternoon', 'Afternoon'),
        ('Evening', 'Evening'),
        ('Night', 'Night'),
    ]

    user = models.ForeignKey(UserAccount, on_delete=models.CASCADE, related_name='availability')
    day_of_week = models.CharField(max_length=3, choices=DAY_CHOICES)
    time_slot = models.CharField(max_length=15, choices=SLOT_CHOICES)

    class Meta:
        unique_together = ('user', 'day_of_week', 'time_slot')
        verbose_name = "Availability Slot"
        verbose_name_plural = "Availability Slots"

    def __str__(self):
        return f"{self.user.get_short_name()} — {self.get_day_of_week_display()}"


# ---------------------------------------------------------------------------
# Friendship
# ---------------------------------------------------------------------------

class Friendship(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
        ('blocked', 'Blocked'),
    )

    user1 = models.ForeignKey(UserAccount, on_delete=models.CASCADE, related_name='friendships_initiated')
    user2 = models.ForeignKey(UserAccount, on_delete=models.CASCADE, related_name='friendships_received')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    message = models.CharField(max_length=150, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user1', 'user2')
        verbose_name = "Friendship"
        verbose_name_plural = "Friendships"

    def __str__(self):
        return f"{self.user1.get_short_name()} & {self.user2.get_short_name()} — {self.status}"


# ---------------------------------------------------------------------------
# Partner Request
# ---------------------------------------------------------------------------

class PartnerRequest(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
    )

    requester = models.ForeignKey(UserAccount, on_delete=models.CASCADE, related_name='partner_requests_sent')
    recipient = models.ForeignKey(UserAccount, on_delete=models.CASCADE, related_name='partner_requests_received')
    message = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Partner Request"
        verbose_name_plural = "Partner Requests"

    def __str__(self):
        return f"Partner Req: {self.requester.get_short_name()} → {self.recipient.get_short_name()}"


# ---------------------------------------------------------------------------
# Message
# ---------------------------------------------------------------------------

class Message(models.Model):
    sender = models.ForeignKey(UserAccount, on_delete=models.CASCADE, related_name='messages_sent')
    recipient = models.ForeignKey(UserAccount, on_delete=models.CASCADE, related_name='messages_received')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['timestamp']
        verbose_name = "Message"
        verbose_name_plural = "Messages"

    def __str__(self):
        return f"{self.sender.get_short_name()} → {self.recipient.get_short_name()}: {self.content[:40]}"


# ---------------------------------------------------------------------------
# Report
# ---------------------------------------------------------------------------

class Report(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('resolved', 'Resolved'),
        ('dismissed', 'Dismissed'),
    )
    TYPE_CHOICES = (
        ('message', 'Message'),
        ('profile', 'Profile'),
        ('behavior', 'Behavior'),
        ('other', 'Other'),
    )
    SEVERITY_CHOICES = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    )

    reporter = models.ForeignKey(UserAccount, on_delete=models.CASCADE, related_name='reports_filed')
    reported_user = models.ForeignKey(UserAccount, on_delete=models.CASCADE, related_name='reports_against')
    reason = models.TextField()
    report_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='other')
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES, default='low')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(blank=True, null=True)
    resolved_by = models.ForeignKey(
        UserAccount, on_delete=models.SET_NULL, null=True, blank=True, related_name='reports_resolved'
    )

    class Meta:
        verbose_name = "Report"
        verbose_name_plural = "Reports"

    def __str__(self):
        return f"Report by {self.reporter.get_short_name()} against {self.reported_user.get_short_name()}"

# ---------------------------------------------------------------------------
# Chat Management
# ---------------------------------------------------------------------------

class DeletedChat(models.Model):
    user = models.ForeignKey(UserAccount, on_delete=models.CASCADE, related_name='deleted_chats_user')
    partner = models.ForeignKey(UserAccount, on_delete=models.CASCADE, related_name='deleted_chats_partner')
    deleted_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'partner')
        verbose_name = "Deleted Chat"
        verbose_name_plural = "Deleted Chats"

    def __str__(self):
        return f"{self.user.get_short_name()} deleted chat with {self.partner.get_short_name()}"

class Block(models.Model):
    blocker = models.ForeignKey(UserAccount, on_delete=models.CASCADE, related_name='blocks_initiated')
    blocked = models.ForeignKey(UserAccount, on_delete=models.CASCADE, related_name='blocks_received')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('blocker', 'blocked')
        verbose_name = "Block"
        verbose_name_plural = "Blocks"

    def __str__(self):
        return f"{self.blocker.get_short_name()} blocked {self.blocked.get_short_name()}"

