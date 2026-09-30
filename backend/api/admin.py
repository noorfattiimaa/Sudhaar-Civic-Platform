from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    User, Issue, IssueUpvote, IssueTimeline, Comment,
    Campaign, BudgetItem, Donation, TransparencyReport
)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'username', 'role', 'is_verified', 'is_active', 'created_at']
    list_filter = ['role', 'is_verified', 'is_active', 'is_staff']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('phone', 'cnic', 'role', 'organization_name', 'is_verified')}),
    )


@admin.register(Issue)
class IssueAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'status', 'priority', 'author', 'upvotes', 'created_at']
    list_filter = ['category', 'status', 'priority', 'created_at']
    search_fields = ['title', 'description', 'location', 'author__email']
    readonly_fields = ['created_at', 'updated_at', 'upvotes']  # Upvotes are user-controlled, admin cannot edit


@admin.register(IssueUpvote)
class IssueUpvoteAdmin(admin.ModelAdmin):
    list_display = ['user', 'issue', 'created_at']
    list_filter = ['created_at']
    readonly_fields = ['user', 'issue', 'created_at']  # Upvotes are user-controlled, admin cannot edit


@admin.register(IssueTimeline)
class IssueTimelineAdmin(admin.ModelAdmin):
    list_display = ['issue', 'status', 'created_by', 'created_at']
    list_filter = ['status', 'created_at']


@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = ['title', 'ngo', 'category', 'goal_amount', 'raised_amount', 'is_verified', 'is_active', 'created_at']
    list_filter = ['category', 'is_verified', 'is_active', 'created_at']
    search_fields = ['title', 'description', 'ngo__email']


@admin.register(BudgetItem)
class BudgetItemAdmin(admin.ModelAdmin):
    list_display = ['campaign', 'item_name', 'total_cost', 'funded_amount']
    list_filter = ['campaign']


@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = ['campaign', 'donor', 'amount', 'is_anonymous', 'created_at']
    list_filter = ['is_anonymous', 'created_at']
    search_fields = ['donor__email', 'campaign__title']


@admin.register(TransparencyReport)
class TransparencyReportAdmin(admin.ModelAdmin):
    list_display = ['title', 'total_funds_donated', 'funds_utilized', 'available_balance', 'created_at']
    list_filter = ['created_at']

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['issue', 'user', 'text', 'created_at']
    list_filter = ['created_at']
    search_fields = ['text', 'user__email', 'issue__title']
