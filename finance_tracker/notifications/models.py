from django.db import models
from django.conf import settings
from core.models import TimeStampedModel

class Notification(TimeStampedModel):
    NOTIFICATION_TYPES = [
        ('BILL_DUE', 'Bill Due'),
        ('BUDGET_EXCEEDED', 'Budget Exceeded'),
        ('GOAL_MILESTONE', 'Goal Milestone'),
        ('GOAL_DEADLINE', 'Goal Deadline'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.notification_type}: {self.title}"
