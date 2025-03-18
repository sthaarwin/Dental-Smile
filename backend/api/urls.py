from django.urls import path
from . import views

urlpatterns = [
    path('auth/login/', views.login_user, name='login'),
    path('auth/register/', views.register_user, name='register'),
    path('auth/me/', views.get_current_user, name='current-user'),
    path('users/profile', views.update_profile, name='update_profile'),
]