from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import views_2fa

router = DefaultRouter()
router.register(r'users', views.UserViewSet, basename='user')
router.register(r'hifz', views.HifzProgressViewSet, basename='hifz')
router.register(r'preferences', views.PartnerPreferenceViewSet, basename='partner-preference')
router.register(r'availability', views.AvailabilityViewSet, basename='availability')
router.register(r'friends', views.FriendshipViewSet, basename='friendship')
router.register(r'partners', views.PartnerRequestViewSet, basename='partner-request')
router.register(r'messages', views.MessageViewSet, basename='message')
router.register(r'reports', views.ReportViewSet, basename='report')

urlpatterns = [
    # Auth
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/verify/', views.VerifyOTPView.as_view(), name='verify-otp'),
    path('auth/resend-code/', views.SendOTPView.as_view(), name='resend-otp'),
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/logout/', views.LogoutView.as_view(), name='logout'),
    path('auth/me/', views.MeView.as_view(), name='me'),
    path('auth/profile/', views.ProfileView.as_view(), name='profile'),
    path('auth/change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    path('auth/delete-account/', views.DeleteAccountView.as_view(), name='delete-account'),
    path('auth/password-reset/', views.PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('auth/password-reset/confirm/', views.SetNewPasswordView.as_view(), name='password-reset-confirm'),
    path('auth/token/refresh/', views.CookieTokenRefreshView.as_view(), name='token-refresh'),

    # 2FA
    path('auth/2fa/login/verify/', views_2fa.Verify2FALoginAPIView.as_view(), name='api-2fa-login-verify'),
    path('auth/2fa/enable/init/', views_2fa.Enable2FAAPIView.as_view(), name='api-2fa-enable-init'),
    path('auth/2fa/setup/', views_2fa.Setup2FAAPIView.as_view(), name='api-2fa-setup'),
    path('auth/2fa/disable/', views_2fa.Disable2FAAPIView.as_view(), name='api-2fa-disable'),

    # Dashboard & Matching
    path('dashboard/stats/', views.DashboardStatsView.as_view(), name='dashboard-stats'),
    path('match/', views.MatchView.as_view(), name='match'),
    path('match/skip/', views.SkipMatchView.as_view(), name='match-skip'),
    path('match/clear-declined/', views.MatchClearDeclinedView.as_view(), name='match-clear-declined'),

    # Admin endpoints
    path('admin/stats/', views.AdminStatsView.as_view(), name='admin-stats'),
    path('admin/users/', views.AdminUsersListView.as_view(), name='admin-users-list'),
    path('admin/users/<uuid:user_id>/ban/', views.AdminBanUserView.as_view(), name='admin-ban-user'),
    path('admin/users/<uuid:user_id>/delete/', views.AdminDeleteUserView.as_view(), name='admin-delete-user'),
    path('admin/users/<uuid:user_id>/role/', views.AdminChangeRoleView.as_view(), name='admin-change-role'),

    # DRF router (viewsets)
    path('', include(router.urls)),

    # Jitsi Meeting Generation
    path('chat/meeting/', views.StartMeetingView.as_view(), name='start-meeting'),
]
