from django.urls import path
from . import views

urlpatterns = [
    path('auth/login/', views.login_user, name='login'),
    path('auth/register/', views.register_user, name='register'),
    path('auth/me/', views.get_current_user, name='current-user'),
    path('auth/profile/', views.update_profile, name='update_profile'),
    path('auth/password-reset/', views.request_password_reset, name='password-reset-request'),
    path('auth/password-reset/confirm/', views.reset_password, name='password-reset-confirm'),
    path('auth/upload-profile-picture/', views.upload_profile_picture, name='upload_profile_picture'),
    # Add a path for a basic API test endpoint
    path('test/', views.example_view, name='test'),
]