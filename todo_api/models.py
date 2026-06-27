from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError

class User(AbstractUser):
    # Enforce email uniqueness at database level
    email = models.EmailField(unique=True, max_length=254)
    
    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.username


class PriorityLevel(models.TextChoices):
    LOW = 'Low', 'Low'
    MEDIUM = 'Medium', 'Medium'
    HIGH = 'High', 'High'


class Todo(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='todos',
        db_column='user_id'
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    is_completed = models.BooleanField(default=False)
    priority = models.CharField(
        max_length=10,
        choices=PriorityLevel.choices,
        default=PriorityLevel.MEDIUM
    )
    due_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'todos'
        indexes = [
            # Note: Django automatically creates an index for ForeignKey (user_id), 
            # so we only define the composite and other custom indexes here.
            models.Index(fields=['user', 'is_completed'], name='idx_todos_user_completed'),
            models.Index(fields=['due_date'], name='idx_todos_due_date'),
        ]
        constraints = [
            # Check constraint to prevent title from being empty or whitespace-only
            models.CheckConstraint(
                condition=~models.Q(title__regex=r'^\s*$'),
                name='title_not_blank'
            )
        ]

    def clean(self):
        if self.title and not self.title.strip():
            raise ValidationError({'title': 'Title cannot be blank or whitespace only.'})
        super().clean()

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} ({self.priority}) - {self.user.username}"

