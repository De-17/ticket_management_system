from django.db import models
from django.db.models import Q

CATEGORY_VALUES = ("billing", "technical", "account", "general")
PRIORITY_VALUES = ("low", "medium", "high", "critical")
STATUS_VALUES = ("open", "in_progress", "resolved", "closed")

class Ticket(models.Model):
    class Category(models.TextChoices):
        BILLING = "billing", "Billing Issue"
        TECHNICAL = "technical", "Technical Issue"
        ACCOUNT = "account", "Account Issue"
        GENERAL = "general", "General"
    
    class Priority(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"
        CRITICAL = "critical", "Critical"

    class Status(models.TextChoices):
        OPEN = "open", "Open"
        IN_PROGRESS = "in_progress", "In Progress"
        RESOLVED = "resolved", "Resolved"
        CLOSED = "closed", "Closed"
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=Category.choices)
    priority = models.CharField(max_length=20, choices=Priority.choices)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.CheckConstraint(
                check=Q(category__in=CATEGORY_VALUES),
                name="ticket_valid_category",
            ),
            models.CheckConstraint(
                check=Q(priority__in=PRIORITY_VALUES),
                name="ticket_valid_priority",
            ),
            models.CheckConstraint(
                check=Q(status__in=STATUS_VALUES),
                name="ticket_valid_status",
            ),
            models.CheckConstraint(check=~Q(title=""), name="ticket_non_empty_title"),
            models.CheckConstraint(check=~Q(description=""), name="ticket_non_empty_description"),
        ]

    def __str__(self) -> str:
        return f"{self.title} ({self.status})"
    