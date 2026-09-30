from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.exceptions import PermissionDenied
from django.db.models import Q, Count, Sum
from django.utils import timezone
from datetime import timedelta

from .models import (
    User, Issue, IssueUpvote, IssueTimeline,
    Campaign, BudgetItem, Donation, TransparencyReport
)
from .serializers import (
    UserSerializer, UserRegistrationSerializer, CustomTokenObtainPairSerializer,
    IssueSerializer, IssueCreateSerializer,
    CampaignSerializer, CampaignCreateSerializer,
    DonationSerializer, BudgetItemSerializer,
    TransparencyReportSerializer, IssueTimelineSerializer
)


class RegisterView(APIView):
    """User registration endpoint"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom login view that accepts email"""
    serializer_class = CustomTokenObtainPairSerializer


class UserViewSet(viewsets.ModelViewSet):
    """User viewset"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user profile"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['put', 'patch'])
    def update_profile(self, request):
        """Update current user profile"""
        serializer = self.get_serializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class IssueViewSet(viewsets.ModelViewSet):
    """Issue viewset"""
    queryset = Issue.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filterset_fields = ['category', 'status', 'priority']
    search_fields = ['title', 'description', 'location']
    ordering_fields = ['created_at', 'upvotes']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return IssueCreateSerializer
        return IssueSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def get_queryset(self):
        queryset = super().get_queryset()
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            if ',' in status_filter:
                statuses = [s.strip() for s in status_filter.split(',')]
                queryset = queryset.filter(status__in=statuses)
            else:
                queryset = queryset.filter(status=status_filter)
        
        if self.request.query_params.get('exclude_resolved', None):
            queryset = queryset.exclude(status='Resolved')
        
        if self.request.query_params.get('resolved_only', None):
            queryset = queryset.filter(status='Resolved')
        
        if self.request.query_params.get('my_reports', None):
            queryset = queryset.filter(author=self.request.user)
        
        return queryset.select_related('author', 'resolved_by').prefetch_related('timeline')
    
    def perform_create(self, serializer):
        print(f"DEBUG: Creating issue for user {self.request.user.email}")
        serializer.save(author=self.request.user)
    
    @action(detail=True, methods=['post'])
    def upvote(self, request, pk=None):
        issue = self.get_object()
        upvote, created = IssueUpvote.objects.get_or_create(
            user=request.user,
            issue=issue
        )
        if created:
            issue.upvotes += 1
            issue.save()
            return Response({'message': 'Upvoted successfully', 'upvotes': issue.upvotes})
        return Response({'message': 'Already upvoted', 'upvotes': issue.upvotes})
    
    @action(detail=True, methods=['post'])
    def remove_upvote(self, request, pk=None):
        issue = self.get_object()
        try:
            upvote = IssueUpvote.objects.get(user=request.user, issue=issue)
            upvote.delete()
            issue.upvotes = max(0, issue.upvotes - 1)
            issue.save()
            return Response({'message': 'Upvote removed', 'upvotes': issue.upvotes})
        except IssueUpvote.DoesNotExist:
            return Response({'message': 'No upvote to remove'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get', 'post'])
    def comments(self, request, pk=None):
        issue = self.get_object()
        if request.method == 'POST':
            from .serializers import CommentSerializer
            serializer = CommentSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                serializer.save(issue=issue, user=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        from .models import Comment
        from .serializers import CommentSerializer
        comments = Comment.objects.filter(issue=issue).order_by('-created_at')
        serializer = CommentSerializer(comments, many=True, context={'request': request})
        return Response(serializer.data)
        
    @action(detail=True, methods=['post'])
    def delete_comment(self, request, pk=None):
        comment_id = request.data.get('comment_id')
        if not comment_id:
            return Response({'error': 'comment_id is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        from .models import Comment
        try:
            comment = Comment.objects.get(id=comment_id, issue_id=pk)
            if comment.user != request.user and request.user.role != 'official':
                return Response({'error': 'You do not have permission to delete this comment'}, status=status.HTTP_403_FORBIDDEN)
                
            comment.delete()
            return Response({'message': 'Comment deleted successfully'})
        except Comment.DoesNotExist:
            return Response({'error': 'Comment not found'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        issue = self.get_object()
        new_status = request.data.get('status')
        if new_status not in dict(Issue.STATUS_CHOICES):
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
        issue.status = new_status
        if new_status == 'Resolved':
            issue.resolved_at = timezone.now()
            issue.resolved_by = request.user
        
        issue.save()
        IssueTimeline.objects.create(
            issue=issue,
            status=new_status,
            description=request.data.get('description', ''),
            created_by=request.user
        )
        serializer = self.get_serializer(issue)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def stats(self, request):
        total = Issue.objects.count()
        resolved = Issue.objects.filter(status='Resolved').count()
        in_progress = Issue.objects.filter(status='In Progress').count()
        active = Issue.objects.exclude(status__in=['Resolved', 'Rejected']).count()
        
        # Calculate resolution rate safely
        resolution_rate = round((resolved / total * 100) if total > 0 else 0, 2)
        
        return Response({
            'total_reported': total,
            'issues_resolved': resolved,
            'in_progress': in_progress,
            'active_issues': active,
            'resolution_rate': resolution_rate
        })


class CampaignViewSet(viewsets.ModelViewSet):
    """Campaign viewset"""
    queryset = Campaign.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filterset_fields = ['category', 'is_verified', 'is_active']
    search_fields = ['title', 'description', 'ngo__organization_name']
    ordering_fields = ['created_at', 'raised_amount']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CampaignCreateSerializer
        return CampaignSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.role == 'ngo':
            return Campaign.objects.filter(ngo=user)
        return Campaign.objects.filter(is_verified=True)
    
    def perform_create(self, serializer):
       if self.request.user.role != 'ngo':
           raise PermissionDenied("Only accounts with the NGO role can create campaigns.")
       serializer.save(ngo=self.request.user)
    
    @action(detail=True, methods=['get'])
    def donations(self, request, pk=None):
        campaign = self.get_object()
        donations = Donation.objects.filter(campaign=campaign).select_related('donor')
        serializer = DonationSerializer(donations, many=True, context={'request': request})
        return Response(serializer.data)


class DonationViewSet(viewsets.ModelViewSet):
    """Donation viewset"""
    queryset = Donation.objects.all()
    serializer_class = DonationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['campaign', 'is_anonymous']
    ordering_fields = ['created_at', 'amount']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        if not self.request.user.is_staff:
            queryset = queryset.filter(donor=self.request.user)
        return queryset.select_related('campaign', 'donor')
    
    def perform_create(self, serializer):
        serializer.save(donor=self.request.user)


class TransparencyReportViewSet(viewsets.ModelViewSet):
    """Transparency report viewset"""
    queryset = TransparencyReport.objects.all()
    serializer_class = TransparencyReportSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    ordering = ['-created_at']
    
    def perform_create(self, serializer):
        campaign = serializer.validated_data.get('campaign')
        if campaign.ngo != self.request.user:
            raise PermissionDenied("You can only upload reports for your own campaigns.")
        serializer.save(created_by=self.request.user)


class DashboardStatsView(APIView):
    """Dashboard statistics endpoint"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        total_issues = Issue.objects.count()
        resolved_issues = Issue.objects.filter(status='Resolved').count()
        active_issues = Issue.objects.exclude(status__in=['Resolved', 'Rejected']).count()
        total_campaigns = Campaign.objects.filter(is_active=True).count()
        total_raised = Donation.objects.aggregate(total=Sum('amount'))['total'] or 0
        total_users = User.objects.count()
        
        return Response({
            'issues': {
                'total_reported': total_issues,
                'resolved': resolved_issues,
                'active': active_issues,
                'resolution_rate': round((resolved_issues / total_issues * 100) if total_issues > 0 else 0, 2)
            },
            'campaigns': {
                'active_campaigns': total_campaigns,
                'total_raised': float(total_raised)
            },
            'users': {
                'total_users': total_users
            }
        })

# --- MISSING VIEW ADDED HERE ---
class TransparencySummaryView(APIView):
    """Public endpoint for aggregated financial data"""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        # 1. Total Funds Donated
        total_raised = Campaign.objects.filter(is_verified=True).aggregate(Sum('raised_amount'))['raised_amount__sum'] or 0

        # 2. Funds Utilized (Mock logic: Sum of budgets for completed campaigns)
        # Ideally, add a 'funds_spent' field to your Campaign model for real tracking
        funds_utilized = Campaign.objects.filter(status='completed').aggregate(Sum('raised_amount'))['raised_amount__sum'] or 0

        # 3. Available Balance
        available_balance = total_raised - funds_utilized

        return Response({
            "total_funds_donated": total_raised,
            "funds_utilized": funds_utilized,
            "available_balance": available_balance
        })