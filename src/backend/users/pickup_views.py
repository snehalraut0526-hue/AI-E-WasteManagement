from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import PickupRequest
from .serializers import PickupRequestSerializer

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def pickup_requests(request):
    """
    GET: List all pickup requests for the authenticated user.
    POST: Create a new pickup request for the authenticated user.
    """
    if request.method == 'GET':
        pickups = PickupRequest.objects.filter(user=request.user).order_by('-created_at')
        serializer = PickupRequestSerializer(pickups, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = PickupRequestSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
