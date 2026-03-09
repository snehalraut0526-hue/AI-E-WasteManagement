from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db.models import Sum, Count
from .models import PickupRequest, RecyclingCenter, Reward
from .serializers import UserSerializer, PickupRequestSerializer

User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_admin_stats(request):
    """Returns platform-wide KPIs."""
    total_users = User.objects.count()
    items_collected = User.objects.aggregate(total=Sum('items_recycled'))['total'] or 0
    active_centers = RecyclingCenter.objects.count()
    pending_pickups = PickupRequest.objects.exclude(status='processed').count()
    
    # Simple change calculation (mocked for now as we don't have historical snapshots)
    return Response({
        'total_users': {'value': total_users, 'change': '+5%'},
        'items_collected': {'value': f"{items_collected / 1000:.1f}K" if items_collected > 1000 else items_collected, 'change': '+8%'},
        'active_centers': {'value': active_centers, 'change': '+2'},
        'pending_pickups': {'value': pending_pickups, 'change': '-3%'},
    })

@api_view(['GET'])
@permission_classes([IsAdminUser])
def list_admin_pickups(request):
    """Lists all pickup requests for management."""
    status_filter = request.query_params.get('status')
    pickups = PickupRequest.objects.all().order_by('-created_at')
    
    if status_filter:
        pickups = pickups.filter(status=status_filter)
        
    data = []
    for p in pickups:
        data.append({
            'id': p.id,
            'tracking_id': p.tracking_id,
            'user': p.user.full_name or p.user.username,
            'device': p.device,
            'qty': p.qty,
            'address': p.address,
            'status': p.status,
            'date': p.date,
            'priority': 'high' if p.qty > 5 else 'normal' # Simple priority logic
        })
    return Response(data)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def update_pickup_status(request, pk):
    """Updates the status of a specific pickup and awards points."""
    try:
        pickup = PickupRequest.objects.get(pk=pk)
        old_status = pickup.status
        new_status = request.data.get('status')
        
        if new_status:
            pickup.status = new_status
            pickup.save()
            
            # Award points if moving from scheduled to collected
            if old_status == 'scheduled' and new_status == 'collected':
                user = pickup.user
                points_to_add = 100 * pickup.qty
                user.eco_points += points_to_add
                user.items_recycled += pickup.qty
                user.save()
                return Response({'message': f'Status updated to {new_status}. {points_to_add} points awarded!'})
                
            return Response({'message': f'Status updated to {new_status}'})
        return Response({'error': 'No status provided'}, status=status.HTTP_400_BAD_REQUEST)
    except PickupRequest.DoesNotExist:
        return Response({'error': 'Pickup not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def list_admin_users(request):
    """Lists users with their recycling stats."""
    users = User.objects.all().order_by('-items_recycled')[:20]
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)
