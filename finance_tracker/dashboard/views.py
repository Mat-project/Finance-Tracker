from django.shortcuts import render
from rest_framework import views, permissions
from rest_framework.response import Response
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta
from transactions.models import Transaction
from goals.models import Goal

# Create your views here.

class DashboardStatsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Get date range
        end_date = timezone.now()
        start_date = end_date - timedelta(days=30)
        
        # Get transactions for the period
        transactions = Transaction.objects.filter(
            user=request.user,
            date__range=[start_date, end_date]
        )
        
        # Calculate totals
        income = transactions.filter(type='income').aggregate(total=Sum('amount'))['total'] or 0
        expenses = transactions.filter(type='expense').aggregate(total=Sum('amount'))['total'] or 0
        
        # Get active goals
        active_goals = Goal.objects.filter(
            user=request.user,
            status='in_progress'
        ).count()
        
        return Response({
            'summary': {
                'income': income,
                'expenses': expenses,
                'balance': income - expenses,
                'active_goals': active_goals
            }
        })
