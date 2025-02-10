from django.shortcuts import render
from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Transaction, Category
from .serializers import TransactionSerializer, CategorySerializer
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum
from rest_framework.authentication import TokenAuthentication
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView
from rest_framework import status
from django.utils import timezone

# Create your views here.

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TransactionPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication]
    pagination_class = TransactionPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['type', 'category', 'date']
    search_fields = ['description']
    ordering_fields = ['date', 'amount']
    ordering = ['-date']

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user).order_by('-date')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'], url_path='by-category')
    def by_category(self, request):
        transactions = self.get_queryset().filter(type='expense')
        categories = {}
        
        for transaction in transactions:
            category_name = transaction.category.name if transaction.category else 'Uncategorized'
            if category_name not in categories:
                categories[category_name] = 0
            categories[category_name] += float(transaction.amount)
        
        # Format response as a list for easier frontend handling
        result = [
            {'name': name, 'amount': amount}
            for name, amount in categories.items()
        ]
        return Response(result)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        transactions = self.get_queryset()
        current_month = timezone.now().month
        current_year = timezone.now().year
        
        # Calculate total income and expenses
        total_income = transactions.filter(type='income').aggregate(Sum('amount'))['amount__sum'] or 0
        total_expenses = transactions.filter(type='expense').aggregate(Sum('amount'))['amount__sum'] or 0
        
        # Calculate monthly totals
        monthly_transactions = transactions.filter(
            date__month=current_month,
            date__year=current_year
        )
        monthly_income = monthly_transactions.filter(type='income').aggregate(Sum('amount'))['amount__sum'] or 0
        monthly_expenses = monthly_transactions.filter(type='expense').aggregate(Sum('amount'))['amount__sum'] or 0
        
        # Calculate previous month's data for comparison
        prev_month = (timezone.now().replace(day=1) - timezone.timedelta(days=1))
        prev_month_transactions = transactions.filter(
            date__month=prev_month.month,
            date__year=prev_month.year
        )
        prev_month_total = (
            prev_month_transactions.filter(type='income').aggregate(Sum('amount'))['amount__sum'] or 0
        ) - (
            prev_month_transactions.filter(type='expense').aggregate(Sum('amount'))['amount__sum'] or 0
        )
        current_month_total = monthly_income - monthly_expenses
        monthly_change = ((current_month_total - prev_month_total) / prev_month_total * 100) if prev_month_total != 0 else 0
        
        return Response({
            'total_income': float(total_income),
            'total_expenses': float(total_expenses),
            'balance': float(total_income - total_expenses),
            'monthly_income': float(monthly_income),
            'monthly_expenses': float(monthly_expenses),
            'monthly_change': float(monthly_change),
            'current_month': {
                'name': timezone.now().strftime('%B'),
                'income': float(monthly_income),
                'expenses': float(monthly_expenses)
            },
            'previous_month': {
                'name': prev_month.strftime('%B'),
                'total': float(prev_month_total)
            }
        })

    @action(detail=False, methods=['get'])
    def trends(self, request):
        from django.db.models.functions import TruncMonth
        from django.db.models import Sum
        from datetime import datetime, timedelta
        
        # Get the last 6 months of data
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=180)
        
        transactions = self.get_queryset().filter(date__gte=start_date)
        
        # Group by month and type
        monthly_data = (
            transactions
            .annotate(month=TruncMonth('date'))
            .values('month', 'type')
            .annotate(total=Sum('amount'))
            .order_by('month')
        )
        
        # Format the data for the frontend
        trends_data = []
        current_month = None
        month_data = {'income': 0, 'expense': 0}
        
        for item in monthly_data:
            month = item['month'].strftime('%Y-%m')
            
            if current_month != month:
                if current_month is not None:
                    trends_data.append({
                        'date': current_month,
                        'income': float(month_data['income']),
                        'expense': float(month_data['expense'])
                    })
                current_month = month
                month_data = {'income': 0, 'expense': 0}
            
            month_data[item['type']] = float(item['total'])
        
        # Add the last month
        if current_month is not None:
            trends_data.append({
                'date': current_month,
                'income': float(month_data['income']),
                'expense': float(month_data['expense'])
            })
        
        return Response(trends_data)

class TransactionSummaryView(APIView):
    def get(self, request):
        user_transactions = Transaction.objects.filter(user=request.user)
        
        total_income = user_transactions.filter(type='income').aggregate(Sum('amount'))['amount__sum'] or 0
        total_expenses = user_transactions.filter(type='expense').aggregate(Sum('amount'))['amount__sum'] or 0
        
        return Response({
            'total_income': total_income,
            'total_expenses': total_expenses,
            'balance': total_income - total_expenses
        })

class TransactionByCategoryView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            # Get all transactions for the authenticated user
            transactions = Transaction.objects.filter(user=request.user)
            
            # Group transactions by category and calculate total
            category_totals = transactions.values(
                'category__id',
                'category__name'
            ).annotate(
                total=Sum('amount')
            ).order_by('-total')
            
            # Format the response
            result = [{
                'id': item['category__id'],
                'name': item['category__name'],
                'total': float(item['total']) if item['total'] else 0
            } for item in category_totals if item['category__id'] is not None]
            
            return Response(result)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
