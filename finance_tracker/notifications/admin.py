from django.contrib import admin
from .models import Notification

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'notification_type', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read', 'created_at', 'user')
    search_fields = ('title', 'message', 'user__username')
    date_hierarchy = 'created_at'
    
    readonly_fields = ('created_at', 'updated_at')
