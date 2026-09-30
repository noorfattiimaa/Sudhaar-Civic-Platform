from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
from django.utils import timezone
from .validators import validate_name_length, validate_phone_number, validate_cnic

class User(AbstractUser):
    """Custom User model with additional fields"""
    ROLE_CHOICES = [
        ('citizen', 'Citizen'),
        ('ngo', 'NGO'),
        ('official', 'Government Official'),
    ]
    
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=50, validators=[validate_name_length], blank=True)
    last_name = models.CharField(max_length=50, validators=[validate_name_length], blank=True)
    phone = models.CharField(max_length=20, blank=True, null=True, validators=[validate_phone_number])
    cnic = models.CharField(max_length=15, blank=True, null=True, validators=[validate_cnic])
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='citizen')
    organization_name = models.CharField(max_length=255, blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    def __str__(self):
        return self.email


class Issue(models.Model):
    """Civic issue reporting model"""
    CATEGORY_CHOICES = [
        ('Roads', 'Roads'),
        ('Sanitation', 'Sanitation'),
        ('Electricity', 'Electricity'),
        ('Water', 'Water'),
        ('Civic', 'Civic'),
        ('Health', 'Health'),
        ('Environment', 'Environment'),
        ('Education', 'Education'),
        ('Other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('Open', 'Open'),
        ('Pending', 'Pending'),
        ('Verified', 'Verified'),
        ('In Progress', 'In Progress'),
        ('Critical', 'Critical'),
        ('Resolved', 'Resolved'),
        ('Rejected', 'Rejected'),
    ]
    
    PRIORITY_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
        ('Critical', 'Critical'),
    ]
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    location = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Open')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, blank=True, null=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reported_issues')
    image = models.ImageField(upload_to='issues/', blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)
    upvotes = models.IntegerField(default=0)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(blank=True, null=True)
    resolved_by = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True, related_name='resolved_issues')
    
    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        # Handle existing issues (Updates)
        if self.pk:
            try:
                old_instance = Issue.objects.get(pk=self.pk)
                
                # Check if status has changed
                if old_instance.status != self.status:
                    # 1. Automatically create Timeline Entry
                    IssueTimeline.objects.create(
                        issue=self,
                        status=self.status,
                        description=f"Status updated from {old_instance.status} to {self.status}."
                    )

                    # 2. Automatically manage 'resolved_at' timestamp
                    if self.status == 'Resolved' and not self.resolved_at:
                        self.resolved_at = timezone.now()
                    elif self.status != 'Resolved':
                        self.resolved_at = None
                        
            except Issue.DoesNotExist:
                pass
        
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class IssueUpvote(models.Model):
    """Track user upvotes on issues"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name='upvote_records')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'issue']
    
    def __str__(self):
        return f"{self.user.email} upvoted {self.issue.title}"


class Comment(models.Model):
    """Comments on issues"""
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Comment by {self.user.email} on {self.issue.title}"


class IssueTimeline(models.Model):
    """Timeline events for issue resolution"""
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name='timeline')
    status = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.issue.title} - {self.status}"


class Campaign(models.Model):
    """Donation campaign model"""
    CATEGORY_CHOICES = [
        ('Health', 'Health'),
        ('Education', 'Education'),
        ('Environment', 'Environment'),
        ('Civic', 'Civic'),
        ('Sanitation', 'Sanitation'),
        ('Water', 'Water'),
        ('Electricity', 'Electricity'),
    ]
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    ngo = models.ForeignKey(User, on_delete=models.CASCADE, related_name='campaigns', limit_choices_to={'role': 'ngo'})
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    image = models.ImageField(upload_to='campaigns/', blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)
    goal_amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    raised_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    donor_count = models.IntegerField(default=0)
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    @property
    def progress_percentage(self):
        if self.goal_amount == 0:
            return 0
        return min(100, int((self.raised_amount / self.goal_amount) * 100))


class BudgetItem(models.Model):
    """Budget breakdown items for campaigns"""
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='budget_items')
    item_name = models.CharField(max_length=255)
    total_cost = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    funded_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    
    class Meta:
        ordering = ['id']
    
    def __str__(self):
        return f"{self.campaign.title} - {self.item_name}"


class Donation(models.Model):
    """Donation records"""
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='donations')
    donor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='donations')
    amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    is_anonymous = models.BooleanField(default=False)
    payment_method = models.CharField(max_length=50, blank=True)
    transaction_id = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.donor.email} donated {self.amount} to {self.campaign.title}"


class TransparencyReport(models.Model):
    """Transparency and financial reports"""
    title = models.CharField(max_length=255)
    description = models.TextField()
    total_funds_donated = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    funds_utilized = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    available_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title