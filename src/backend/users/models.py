from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    eco_points = models.IntegerField(default=0)
    items_recycled = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'full_name']

    def __str__(self):
        return self.email

import uuid

class PickupRequest(models.Model):
    STATUS_CHOICES = (
        ('scheduled', 'Scheduled'),
        ('collected', 'Collected'),
        ('in-transit', 'In Transit'),
        ('at-facility', 'At Facility'),
        ('processed', 'Processed'),
    )

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='pickup_requests')
    device = models.CharField(max_length=255)
    qty = models.IntegerField(default=1)
    address = models.TextField()
    date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    tracking_id = models.CharField(max_length=20, unique=True, editable=False, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.tracking_id:
            self.tracking_id = f"ECO-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Pickup {self.tracking_id} - {self.device} ({self.status})"

class RecyclingCenter(models.Model):
    name = models.CharField(max_length=255)
    address = models.TextField()
    phone = models.CharField(max_length=30, blank=True)
    lat = models.FloatField()
    lng = models.FloatField()
    rating = models.FloatField(default=4.0)
    open_now = models.BooleanField(default=True)
    types = models.CharField(max_length=500, help_text="Comma-separated types, e.g. Phones,Batteries")

    def get_types_list(self):
        return [t.strip() for t in self.types.split(',') if t.strip()]

    def __str__(self):
        return self.name

class Reward(models.Model):
    name = models.CharField(max_length=255)
    points_cost = models.IntegerField()
    icon = models.CharField(max_length=10, help_text="Emoji icon")
    category = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.name} ({self.points_cost} pts)"

class Redemption(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='redemptions')
    reward = models.ForeignKey(Reward, on_delete=models.CASCADE)
    redeemed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} redeemed {self.reward.name}"