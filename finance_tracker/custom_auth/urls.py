from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('me/', views.profile_view, name='me'),
    path('profile/', views.profile_view, name='profile'),
    path('settings/', views.UserSettingsView.as_view(), name='user-settings'),
]
