from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from .models import Notification

@shared_task
def send_notification_email(user_id, title, message):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    try:
        user = User.objects.get(id=user_id)
        
        # Create notification in database
        Notification.objects.create(
            user=user,
            title=title,
            message=message,
            notification_type='SYSTEM'
        )
        
        # Send email
        send_mail(
            subject=title,
            message=message,
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[user.email],
            fail_silently=False,
        )
        
        return f"Notification sent to {user.email}"
    except User.DoesNotExist:
        return f"User {user_id} not found"
    except Exception as e:
        return f"Error sending notification: {str(e)}"

@shared_task
def check_goal_deadlines():
    from goals.models import Goal
    from django.utils import timezone
    
    upcoming_goals = Goal.objects.filter(
        status='in_progress',
        deadline__lte=timezone.now() + timezone.timedelta(days=7)
    )
    
    for goal in upcoming_goals:
        send_notification_email.delay(
            goal.user.id,
            "Goal Deadline Approaching",
            f"Your goal '{goal.title}' is due in {(goal.deadline - timezone.now().date()).days} days"
        ) 