from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from transactions.models import Transaction, Category
from decimal import Decimal

User = get_user_model()

class TransactionViewSetTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        
        self.category = Category.objects.create(
            user=self.user,
            name='Test Category'
        )

    def test_create_transaction(self):
        url = reverse('transaction-list')
        data = {
            'date': '2024-03-15',
            'description': 'Test Transaction',
            'amount': '100.00',
            'type': 'expense',
            'category': self.category.id
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Transaction.objects.count(), 1)
        self.assertEqual(Transaction.objects.get().description, 'Test Transaction')

    def test_list_transactions(self):
        Transaction.objects.create(
            user=self.user,
            date='2024-03-15',
            description='Test Transaction',
            amount=Decimal('100.00'),
            type='expense',
            category=self.category
        )
        url = reverse('transaction-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1) 