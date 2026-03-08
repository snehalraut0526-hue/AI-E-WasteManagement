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