from django.contrib import admin
from .models import Goal

@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'target_amount', 'current_amount', 'deadline', 'status')
    list_filter = ('status', 'deadline', 'user')
    search_fields = ('title', 'description', 'user__username')
    date_hierarchy = 'deadline'
    
    readonly_fields = ('created_at', 'updated_at')
    
    def get_progress(self, obj):
        if obj.target_amount == 0:
            return '0%'
        return f"{(obj.current_amount / obj.target_amount * 100):.1f}%"
    
    get_progress.short_description = 'Progress'
