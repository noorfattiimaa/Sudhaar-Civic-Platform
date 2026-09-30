from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .validators import validate_password_strength, validate_name_length
from .models import (
    User, Issue, IssueUpvote, IssueTimeline, Comment,
    Campaign, BudgetItem, Donation, TransparencyReport
)


class UserSerializer(serializers.ModelSerializer):
    """User serializer"""
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 
                  'phone', 'cnic', 'role', 'organization_name', 'is_verified']
        read_only_fields = ['id', 'is_verified']


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom token serializer that accepts email instead of username"""
    username_field = 'email'
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        return token
    
    def validate(self, attrs):
        # Get email from request data
        email = attrs.get('email') or attrs.get('username')
        password = attrs.get('password')
        
        if not email or not password:
            raise serializers.ValidationError('Must include "email" and "password".')
        
        # Try to get user by email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError('No active account found with the given credentials.')
        
        if not user.check_password(password):
            raise serializers.ValidationError('No active account found with the given credentials.')
        
        if not user.is_active:
            raise serializers.ValidationError('User account is disabled.')
        
        # Create token
        refresh = self.get_token(user)
        
        # Include user data in response
        data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        }
        
        return data


class UserRegistrationSerializer(serializers.ModelSerializer):
    """User registration serializer"""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password_strength])
    password2 = serializers.CharField(write_only=True, required=True)
    first_name = serializers.CharField(max_length=50, validators=[validate_name_length], required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=50, validators=[validate_name_length], required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = ['email', 'username', 'password', 'password2', 'first_name', 
                  'last_name', 'phone', 'cnic', 'role', 'organization_name']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        # Validate name length
        first_name = attrs.get('first_name', '')
        last_name = attrs.get('last_name', '')
        full_name = f"{first_name} {last_name}".strip()
        if full_name and len(full_name) > 50:
            raise serializers.ValidationError({"first_name": "Full name cannot exceed 50 characters."})
        
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            password=validated_data.pop('password'),
            **validated_data
        )
        return user


class IssueTimelineSerializer(serializers.ModelSerializer):
    """Issue timeline serializer"""
    created_by_email = serializers.EmailField(source='created_by.email', read_only=True)
    
    class Meta:
        model = IssueTimeline
        fields = ['id', 'status', 'description', 'created_by_email', 'created_at']
        read_only_fields = ['id', 'created_at']


class IssueSerializer(serializers.ModelSerializer):
    author_email = serializers.EmailField(source='author.email', read_only=True)
    author_name = serializers.SerializerMethodField()
    image_url_full = serializers.SerializerMethodField()
    timeline = IssueTimelineSerializer(many=True, read_only=True)
    time_text = serializers.SerializerMethodField()
    user_has_upvoted = serializers.SerializerMethodField()
    
    class Meta:
        model = Issue
        # FIXED: Removed the manual 'location' override line above.
        # DRF will now automatically use 'location' from your model correctly.
        fields = ['id', 'title', 'description', 'location', 'category', 'status', 
                  'priority', 'author', 'author_email', 'author_name', 'image', 
                  'image_url', 'image_url_full', 'upvotes', 'latitude', 'longitude',
                  'created_at', 'updated_at', 'resolved_at', 'resolved_by', 
                  'timeline', 'time_text', 'user_has_upvoted']
        read_only_fields = ['id', 'created_at', 'updated_at', 'upvotes']
    
    def get_author_name(self, obj):
        return f"{obj.author.first_name} {obj.author.last_name}".strip() or obj.author.username
    
    def get_image_url_full(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
        return obj.image_url
    
    def get_time_text(self, obj):
        from django.utils import timezone
        delta = timezone.now() - obj.created_at
        if delta.days > 0:
            return f"{delta.days} day{'s' if delta.days > 1 else ''} ago"
        elif delta.seconds > 3600:
            hours = delta.seconds // 3600
            return f"{hours} hour{'s' if hours > 1 else ''} ago"
        elif delta.seconds > 60:
            minutes = delta.seconds // 60
            return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
        else:
            return "Just now"
    
    def get_user_has_upvoted(self, obj):
        """Check if the current user has upvoted this issue"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            from .models import IssueUpvote
            return IssueUpvote.objects.filter(user=request.user, issue=obj).exists()
        return False


class CommentSerializer(serializers.ModelSerializer):
    """Comment serializer"""
    user_name = serializers.SerializerMethodField()
    user_avatar = serializers.SerializerMethodField()
    is_own_comment = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = ['id', 'issue', 'user', 'user_name', 'user_avatar', 'text', 'created_at', 'updated_at', 'is_own_comment']
        read_only_fields = ['id', 'issue', 'user', 'created_at', 'updated_at']
    
    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username
    
    def get_user_avatar(self, obj):
        # Return first letter of username for avatar
        return obj.user.username[0].upper() if obj.user.username else "U"
        
    def get_is_own_comment(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.user == request.user
        return False


class IssueCreateSerializer(serializers.ModelSerializer):
    """Issue creation serializer"""
    class Meta:
        model = Issue
        fields = ['title', 'description', 'location', 'category', 'priority', 
                  'image', 'image_url', 'latitude', 'longitude']
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class BudgetItemSerializer(serializers.ModelSerializer):
    """Budget item serializer"""
    class Meta:
        model = BudgetItem
        fields = ['id', 'item_name', 'total_cost', 'funded_amount']
        read_only_fields = ['id']


class CampaignSerializer(serializers.ModelSerializer):
    """Campaign serializer"""
    ngo_name = serializers.CharField(source='ngo.organization_name', read_only=True)
    ngo_email = serializers.EmailField(source='ngo.email', read_only=True)
    image_url_full = serializers.SerializerMethodField()
    budget_items = BudgetItemSerializer(many=True, read_only=True)
    progress_percentage = serializers.ReadOnlyField()
    
    class Meta:
        model = Campaign
        fields = ['id', 'title', 'description', 'ngo', 'ngo_name', 'ngo_email',
                  'category', 'image', 'image_url', 'image_url_full', 'goal_amount',
                  'raised_amount', 'donor_count', 'is_verified', 'is_active',
                  'budget_items', 'progress_percentage', 'created_at', 'updated_at']
        read_only_fields = ['id', 'raised_amount', 'donor_count', 'created_at', 'updated_at']
    
    def get_image_url_full(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
        return obj.image_url


class CampaignCreateSerializer(serializers.ModelSerializer):
    """Campaign creation serializer"""
    budget_items = BudgetItemSerializer(many=True, required=False)
    
    class Meta:
        model = Campaign
        fields = ['title', 'description', 'category', 'image', 'image_url',
                  'goal_amount', 'budget_items']
    
    def create(self, validated_data):
        budget_items_data = validated_data.pop('budget_items', [])
        validated_data['ngo'] = self.context['request'].user
        campaign = Campaign.objects.create(**validated_data)
        
        for item_data in budget_items_data:
            BudgetItem.objects.create(campaign=campaign, **item_data)
        
        return campaign


class DonationSerializer(serializers.ModelSerializer):
    """Donation serializer"""
    donor_email = serializers.EmailField(source='donor.email', read_only=True)
    donor_name = serializers.SerializerMethodField()
    campaign_title = serializers.CharField(source='campaign.title', read_only=True)
    
    class Meta:
        model = Donation
        fields = ['id', 'campaign', 'campaign_title', 'donor', 'donor_email',
                  'donor_name', 'amount', 'is_anonymous', 'payment_method',
                  'transaction_id', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_donor_name(self, obj):
        if obj.is_anonymous:
            return "Anonymous"
        return f"{obj.donor.first_name} {obj.donor.last_name}".strip() or obj.donor.username
    
    def create(self, validated_data):
        validated_data['donor'] = self.context['request'].user
        donation = Donation.objects.create(**validated_data)
        
        # Update campaign raised amount and donor count
        campaign = donation.campaign
        campaign.raised_amount += donation.amount
        campaign.donor_count += 1
        campaign.save()
        
        return donation


class TransparencyReportSerializer(serializers.ModelSerializer):
    """Transparency report serializer"""
    created_by_email = serializers.EmailField(source='created_by.email', read_only=True)
    
    class Meta:
        model = TransparencyReport
        fields = ['id', 'title', 'description', 'total_funds_donated',
                  'funds_utilized', 'available_balance', 'created_by',
                  'created_by_email', 'created_at']
        read_only_fields = ['id', 'created_at']

