from django.contrib import admin
from .models import Transaction, Category

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'icon', 'color')
    list_filter = ('user',)
    search_fields = ('name', 'user__username')

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('date', 'description', 'amount', 'type', 'category', 'user')
    list_filter = ('type', 'category', 'date', 'user')
    search_fields = ('description', 'user__username')
    date_hierarchy = 'date'
