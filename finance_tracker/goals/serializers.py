from rest_framework import serializers
from .models import Goal
from django.utils import timezone
from decimal import Decimal

class GoalSerializer(serializers.ModelSerializer):
    progress_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = Goal
        fields = ('id', 'title', 'description', 'target_amount', 
                 'current_amount', 'deadline', 'status', 'progress_percentage')
        read_only_fields = ('id', 'current_amount', 'status')
    
    def validate_title(self, value):
        if not value.strip():
            raise serializers.ValidationError("Title cannot be empty.")
        return value.strip()

    def validate_target_amount(self, value):
        if value <= Decimal('0'):
            raise serializers.ValidationError("Target amount must be greater than 0.")
        return value

    def validate_deadline(self, value):
        today = timezone.now().date()
        if value < today:
            raise serializers.ValidationError("Deadline cannot be in the past.")
        return value

    def validate(self, data):
        # Additional cross-field validation can be added here
        return data
    
    def get_progress_percentage(self, obj):
        if obj.target_amount == 0:
            return 0
        return round((obj.current_amount / obj.target_amount) * 100, 2)

    def create(self, validated_data):
        # Set initial status to 'in_progress'
        validated_data['status'] = 'in_progress'
        validated_data['current_amount'] = Decimal('0')
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Don't allow updating current_amount through regular update
        validated_data.pop('current_amount', None)
        
        # Update status based on current progress if target_amount changes
        if 'target_amount' in validated_data:
            new_target = validated_data['target_amount']
            if instance.current_amount >= new_target:
                validated_data['status'] = 'completed'
            else:
                validated_data['status'] = 'in_progress'
        
        return super().update(instance, validated_data) 