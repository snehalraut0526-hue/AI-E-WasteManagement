from django.urls import path
from . import views
from . import ai_views
from . import pickup_views
from . import center_views
from . import tracking_views
from . import reward_views
from . import admin_views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('profile/', views.get_profile, name='profile'),
    path('logout/', views.logout, name='logout'),
    path('detect/', ai_views.detect_device, name='detect_device'),
    path('pickups/', pickup_views.pickup_requests, name='pickups'),
    path('pickups/<str:tracking_id>/', tracking_views.get_pickup_detail, name='pickup_detail'),
    path('pickups/<str:tracking_id>/advance/', tracking_views.advance_pickup_status, name='advance_status'),
    path('centers/', center_views.list_centers, name='centers'),
    path('rewards/', reward_views.list_rewards, name='rewards'),
    path('rewards/redeem/', reward_views.redeem_reward, name='redeem_reward'),
    
    # Admin routes
    path('admin/stats/', admin_views.get_admin_stats, name='admin_stats'),
    path('admin/pickups/', admin_views.list_admin_pickups, name='admin_pickups'),
    path('admin/pickups/<int:pk>/update/', admin_views.update_pickup_status, name='admin_update_pickup'),
    path('admin/users/', admin_views.list_admin_users, name='admin_users'),
]