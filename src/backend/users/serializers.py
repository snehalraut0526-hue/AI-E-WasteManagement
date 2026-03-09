from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'username', 'full_name', 'phone', 'password', 'confirm_password']

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match")
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            full_name=validated_data.get('full_name', ''),
            phone=validated_data.get('phone', ''),
            password=validated_data['password']
        )
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'full_name', 'phone', 'eco_points', 'items_recycled', 'created_at']

from .models import PickupRequest, Reward

class PickupRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = PickupRequest
        fields = ['id', 'user', 'device', 'qty', 'address', 'date', 'notes', 'status', 'tracking_id', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'status', 'tracking_id', 'created_at', 'updated_at']

class RewardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reward
        fields = '__all__'