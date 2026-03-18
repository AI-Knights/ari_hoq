"""Admin configuration — rb-woodroff fieldsets pattern, all models registered."""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    UserAccount, OTP, HifzProgress, PartnerPreference,
    Availability, Friendship, PartnerRequest, Message, Report,
)


# ---------------------------------------------------------------------------
# UserAccount Admin
# ---------------------------------------------------------------------------

@admin.register(UserAccount)
class UserAccountAdmin(BaseUserAdmin):
    """Custom admin for UserAccount with grouped fieldsets."""
    list_display = ('email', 'full_name', 'username', 'role', 'is_active', 'is_2fa_enabled', 'is_staff', 'is_suspended', 'date_joined')
    list_filter = ('role', 'is_active', 'is_2fa_enabled', 'is_staff', 'is_superuser', 'is_suspended', 'date_joined')
    search_fields = ('email', 'full_name', 'username')
    ordering = ('-date_joined',)

    fieldsets = (
        ('Account', {
            'fields': ('email', 'password', 'username', 'full_name', 'avatar')
        }),
        ('Two-Factor Auth', {
            'fields': ('is_2fa_enabled', 'totp_secret', 'manage_2fa_link'),
        }),
        ('Role & Status', {
            'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'is_suspended', 'warnings_count')
        }),
        ('Profile', {
            'classes': ('collapse',),
            'fields': ('level', 'bio', 'location', 'timezone', 'primary_language', 'gender')
        }),
        ('Stats', {
            'classes': ('collapse',),
            'fields': ('memorized_surahs_count', 'current_streak')
        }),
        ('Permissions', {
            'classes': ('collapse',),
            'fields': ('groups', 'user_permissions')
        }),
        ('Important Dates', {
            'fields': ('last_login', 'date_joined', 'last_active')
        }),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'full_name', 'username', 'role', 'password1', 'password2', 'is_active', 'is_staff'),
        }),
    )

    readonly_fields = ('date_joined', 'last_login', 'last_active', 'totp_secret', 'manage_2fa_link')

    def manage_2fa_link(self, obj):
        from django.utils.html import format_html
        return format_html('<a href="/admin-settings/" target="_blank">Manage My 2FA Settings</a>')
    manage_2fa_link.short_description = 'Actions'


# ---------------------------------------------------------------------------
# OTP Admin
# ---------------------------------------------------------------------------

@admin.register(OTP)
class OTPAdmin(admin.ModelAdmin):
    """Admin for OTP model — rb-woodroff style with validity indicator."""
    list_display = ('user', 'otp', 'created_at', 'validity_status')
    list_filter = ('created_at',)
    search_fields = ('user__email', 'user__full_name', 'otp')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)

    def validity_status(self, obj):
        return "✓ Valid" if obj.is_valid() else "✗ Expired"
    validity_status.short_description = 'Status'


# ---------------------------------------------------------------------------
# HifzProgress Admin
# ---------------------------------------------------------------------------

@admin.register(HifzProgress)
class HifzProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'surah_number', 'status', 'completed_ayahs', 'last_reviewed')
    list_filter = ('status',)
    search_fields = ('user__email', 'user__full_name')
    ordering = ('user', 'surah_number')


# ---------------------------------------------------------------------------
# PartnerPreference Admin
# ---------------------------------------------------------------------------

@admin.register(PartnerPreference)
class PartnerPreferenceAdmin(admin.ModelAdmin):
    list_display = ('user', 'level', 'preferred_language', 'timezone', 'gender_pref', 'is_available', 'updated_at')
    list_filter = ('is_available', 'gender_pref')
    search_fields = ('user__email', 'user__full_name')


# ---------------------------------------------------------------------------
# Availability Admin
# ---------------------------------------------------------------------------

@admin.register(Availability)
class AvailabilityAdmin(admin.ModelAdmin):
    list_display = ('user', 'day_of_week', 'time_slot')
    search_fields = ('user__email', 'user__full_name')


# ---------------------------------------------------------------------------
# Friendship Admin
# ---------------------------------------------------------------------------

@admin.register(Friendship)
class FriendshipAdmin(admin.ModelAdmin):
    list_display = ('user1', 'user2', 'status', 'created_at', 'updated_at')
    list_filter = ('status',)
    search_fields = ('user1__email', 'user2__email', 'user1__full_name', 'user2__full_name')
    ordering = ('-created_at',)


# ---------------------------------------------------------------------------
# PartnerRequest Admin
# ---------------------------------------------------------------------------

@admin.register(PartnerRequest)
class PartnerRequestAdmin(admin.ModelAdmin):
    list_display = ('requester', 'recipient', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('requester__email', 'recipient__email')
    ordering = ('-created_at',)


# ---------------------------------------------------------------------------
# Message Admin
# ---------------------------------------------------------------------------

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'recipient', 'short_content', 'timestamp', 'is_read')
    list_filter = ('is_read', 'timestamp')
    search_fields = ('sender__email', 'recipient__email', 'content')
    readonly_fields = ('timestamp',)
    ordering = ('-timestamp',)

    def short_content(self, obj):
        return obj.content[:60] + ('...' if len(obj.content) > 60 else '')
    short_content.short_description = 'Content'


# ---------------------------------------------------------------------------
# Report Admin
# ---------------------------------------------------------------------------

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('reporter', 'reported_user', 'report_type', 'severity', 'status', 'created_at')
    list_filter = ('status', 'report_type', 'severity')
    search_fields = ('reporter__email', 'reported_user__email', 'reason')
    readonly_fields = ('created_at', 'resolved_at')
    ordering = ('-created_at',)

    fieldsets = (
        ('Report Details', {
            'fields': ('reporter', 'reported_user', 'reason', 'report_type', 'severity')
        }),
        ('Resolution', {
            'fields': ('status', 'resolved_by', 'resolved_at')
        }),
        ('Timestamps', {
            'fields': ('created_at',)
        }),
    )
