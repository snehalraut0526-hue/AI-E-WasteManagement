from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import Reward, Redemption
from .serializers import RewardSerializer

@api_view(['GET'])
@permission_classes([AllowAny])
def list_rewards(request):
    """
    List all available rewards.
    """
    rewards = Reward.objects.all()
    serializer = RewardSerializer(rewards, many=True)
    
    # If authenticated, include redemption status
    data = serializer.data
    if request.user.is_authenticated:
        redeemed_ids = Redemption.objects.filter(user=request.user).values_list('reward_id', flat=True)
        for item in data:
            item['is_redeemed'] = item['id'] in redeemed_ids
            
    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def redeem_reward(request):
    """
    Redeem a reward using EcoPoints.
    """
    reward_id = request.data.get('reward_id')
    try:
        reward = Reward.objects.get(id=reward_id)
    except Reward.DoesNotExist:
        return Response({"error": "Reward not found"}, status=status.HTTP_404_NOT_FOUND)

    # Check if already redeemed
    if Redemption.objects.filter(user=request.user, reward=reward).exists():
        return Response({"error": "Reward already redeemed"}, status=status.HTTP_400_BAD_REQUEST)

    # Check points
    user = request.user
    if user.eco_points < reward.points_cost:
        return Response({"error": "Insufficient EcoPoints"}, status=status.HTTP_400_BAD_REQUEST)

    # Deduct points and create redemption
    user.eco_points -= reward.points_cost
    user.save()
    
    Redemption.objects.create(user=user, reward=reward)

    return Response({
        "message": f"Successfully redeemed {reward.name}!",
        "new_balance": user.eco_points
    })
