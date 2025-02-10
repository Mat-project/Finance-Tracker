from django.apps import AppConfig

class CustomAuthConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'custom_auth'
    label = 'custom_auth'  # Using custom label to avoid conflicts with Django's auth 