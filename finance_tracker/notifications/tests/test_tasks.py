from django.test import TestCase
from django.contrib.auth import get_user_model
from notifications.tasks import send_notification_email, check_goal_deadlines
from notifications.models import Notification
from goals.models import Goal
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from unittest.mock import patch

User = get_user_model()

class NotificationTasksTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

    @patch('notifications.tasks.send_mail')
    def test_send_notification_email(self, mock_send_mail):
        result = send_notification_email(
            self.user.id,
            "Test Notification",
            "Test Message"
        )
        
        self.assertTrue(mock_send_mail.called)
        self.assertEqual(Notification.objects.count(), 1)
        notification = Notification.objects.first()
        self.assertEqual(notification.title, "Test Notification")
        self.assertEqual(notification.user, self.user)

    @patch('notifications.tasks.send_notification_email.delay')
    def test_check_goal_deadlines(self, mock_send_notification):
        # Create a goal with deadline in 5 days
        Goal.objects.create(
            user=self.user,
            title='Test Goal',
            target_amount=Decimal('1000.00'),
            deadline=timezone.now().date() + timedelta(days=5)
        )
        
        check_goal_deadlines()
        self.assertTrue(mock_send_notification.called) 