from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import PickupRequest
from .serializers import PickupRequestSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_pickup_detail(request, tracking_id):
    """
    Get tracking details for a specific pickup.
    """
    try:
        pickup = PickupRequest.objects.get(tracking_id=tracking_id, user=request.user)
        serializer = PickupRequestSerializer(pickup)
        return Response(serializer.data)
    except PickupRequest.DoesNotExist:
        return Response({"error": "Pickup not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def advance_pickup_status(request, tracking_id):
    """
    Demo endpoint to advance a pickup's status manually for testing/hackathon.
    """
    try:
        pickup = PickupRequest.objects.get(tracking_id=tracking_id, user=request.user)
    except PickupRequest.DoesNotExist:
        return Response({"error": "Pickup not found"}, status=status.HTTP_404_NOT_FOUND)

    status_order = ['scheduled', 'collected', 'in-transit', 'at-facility', 'processed']
    try:
        current_index = status_order.index(pickup.status)
    except ValueError:
        current_index = 0

    if current_index < len(status_order) - 1:
        pickup.status = status_order[current_index + 1]
        pickup.save()
        
        # If processed, award EcoPoints
        if pickup.status == 'processed':
            user = pickup.user
            points_to_add = pickup.qty * 100
            user.eco_points += points_to_add
            user.items_recycled += pickup.qty
            user.save()

    serializer = PickupRequestSerializer(pickup)
    return Response(serializer.data)
