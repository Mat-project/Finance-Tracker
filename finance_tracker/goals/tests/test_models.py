from django.test import TestCase
from django.contrib.auth import get_user_model
from goals.models import Goal
from decimal import Decimal
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

class GoalModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.goal = Goal.objects.create(
            user=self.user,
            title='Test Goal',
            description='Test Description',
            target_amount=Decimal('1000.00'),
            current_amount=Decimal('500.00'),
            deadline=timezone.now().date() + timedelta(days=30),
            status='in_progress'
        )

    def test_goal_creation(self):
        self.assertEqual(self.goal.title, 'Test Goal')
        self.assertEqual(self.goal.target_amount, Decimal('1000.00'))
        self.assertEqual(self.goal.status, 'in_progress')

    def test_goal_progress(self):
        progress = (self.goal.current_amount / self.goal.target_amount) * 100
        self.assertEqual(progress, 50.0) 