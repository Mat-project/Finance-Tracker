from django.test import TestCase
from django.contrib.auth import get_user_model
from transactions.models import Transaction, Category
from decimal import Decimal

User = get_user_model()

class TransactionModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.category = Category.objects.create(
            user=self.user,
            name='Test Category'
        )
        self.transaction = Transaction.objects.create(
            user=self.user,
            date='2024-03-15',
            description='Test Transaction',
            amount=Decimal('100.00'),
            type='expense',
            category=self.category
        )

    def test_transaction_creation(self):
        self.assertEqual(self.transaction.description, 'Test Transaction')
        self.assertEqual(self.transaction.amount, Decimal('100.00'))
        self.assertEqual(self.transaction.type, 'expense')
        self.assertEqual(self.transaction.category, self.category)

    def test_transaction_str_method(self):
        expected_str = 'expense - 100.00 - 2024-03-15'
        self.assertEqual(str(self.transaction), expected_str) 