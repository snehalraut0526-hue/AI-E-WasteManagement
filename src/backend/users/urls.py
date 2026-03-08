from django.urls import path
from . import views
from . import ai_views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('profile/', views.get_profile, name='profile'),
    path('logout/', views.logout, name='logout'),
    path('detect/', ai_views.detect_device, name='detect_device'),
]