from django.urls import path
from . import views

urlpatterns = [
    path('example/', views.example_view, name='example'),
    path('auth/register/', views.register_user, name='register'),
    path('auth/login/', views.login_user, name='login'),
]