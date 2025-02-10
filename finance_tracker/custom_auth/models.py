from django.contrib.auth.models import AbstractUser
from django.db import models
from core.models import TimeStampedModel
# This can be empty if you're not defining custom models 

class User(AbstractUser, TimeStampedModel):
    # Profile fields
    email = models.EmailField(unique=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    phone_number = models.CharField(max_length=15, blank=True)
    
    # Settings fields
    email_notifications = models.BooleanField(default=True)
    theme_preference = models.CharField(
        max_length=20,
        choices=[('light', 'Light'), ('dark', 'Dark'), ('system', 'System')],
        default='system'
    )
    currency_preference = models.CharField(
        max_length=3,
        choices=[('USD', 'USD'), ('EUR', 'EUR'), ('GBP', 'GBP')],
        default='USD'
    )
    # Fix reverse accessor clashes with unique related_names
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_auth_user_set',
        blank=True,
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_auth_user_set',
        blank=True,
        verbose_name='user permissions',
    )
    # Add any other settings fields you need 

    class Meta:
        app_label = 'custom_auth'
        db_table = 'custom_auth_user'
        swappable = 'AUTH_USER_MODEL'

    def __str__(self):
        return self.email or self.username 