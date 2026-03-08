from django.urls import path
from . import views
from . import ai_views
from . import pickup_views
from . import center_views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('profile/', views.get_profile, name='profile'),
    path('logout/', views.logout, name='logout'),
    path('detect/', ai_views.detect_device, name='detect_device'),
    path('pickups/', pickup_views.pickup_requests, name='pickups'),
    path('centers/', center_views.list_centers, name='centers'),
]