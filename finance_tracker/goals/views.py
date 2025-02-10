from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Goal
from .serializers import GoalSerializer
from decimal import Decimal

# Create your views here.

class GoalViewSet(viewsets.ModelViewSet):
    serializer_class = GoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Goal.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['POST'])
    def update_progress(self, request, pk=None):
        try:
            goal = self.get_object()
            amount = request.data.get('amount', 0)
            
            # Convert amount to Decimal and handle potential errors
            try:
                amount = Decimal(str(amount))  # Convert to string first to avoid float precision issues
            except (TypeError, ValueError):
                return Response(
                    {'error': 'Invalid amount value'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update current amount
            goal.current_amount = max(Decimal('0'), goal.current_amount + amount)
            
            # Check if goal is completed
            if goal.current_amount >= goal.target_amount:
                goal.status = 'completed'
                goal.current_amount = goal.target_amount  # Cap at target amount
            
            goal.save()
            
            serializer = self.get_serializer(goal)
            return Response(serializer.data)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
