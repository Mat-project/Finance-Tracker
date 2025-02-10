from django.contrib.auth.models import AbstractUser
from django.db import models
from core.models import TimeStampedModel

# Note: We are using the User model from custom_auth.models
# If you need to reference the User model, use:
# from django.contrib.auth import get_user_model
# User = get_user_model()

# Temporarily comment out or remove this model
class User(AbstractUser, TimeStampedModel):
     email = models.EmailField(unique=True)
     profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
     phone_number = models.CharField(max_length=15, blank=True)
     preferred_currency = models.CharField(max_length=3, default='USD')
     email_notifications = models.BooleanField(default=False)
     budget_alert_threshold = models.IntegerField(default=80)

     def __str__(self):
         return self.email

""" class User(AbstractUser, TimeStampedModel):
    email = models.EmailField(unique=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    phone_number = models.CharField(max_length=15, blank=True)
    preferred_currency = models.CharField(max_length=3, default='USD')

    # Fix reverse accessor clashes with unique related_names
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='users_user_set',  # Changed to be unique
        blank=True,
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='users_user_set',  # Changed to be unique
        blank=True,
        verbose_name='user permissions',
    )

    def __str__(self):
        return self.email
 """