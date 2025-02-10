from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from goals.models import Goal
from decimal import Decimal
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

class GoalViewSetTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)

    def test_create_goal(self):
        url = reverse('goal-list')
        data = {
            'title': 'Test Goal',
            'description': 'Test Description',
            'target_amount': '1000.00',
            'deadline': (timezone.now().date() + timedelta(days=30)).isoformat()
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Goal.objects.count(), 1)

    def test_update_goal_progress(self):
        goal = Goal.objects.create(
            user=self.user,
            title='Test Goal',
            target_amount=Decimal('1000.00'),
            current_amount=Decimal('0.00'),
            deadline=timezone.now().date() + timedelta(days=30)
        )
        url = reverse('goal-update-progress', args=[goal.id])
        response = self.client.post(url, {'amount': '500.00'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        goal.refresh_from_db()
        self.assertEqual(goal.current_amount, Decimal('500.00')) 