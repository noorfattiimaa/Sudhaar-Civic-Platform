from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, CustomTokenObtainPairView, UserViewSet, IssueViewSet, CampaignViewSet,
    DonationViewSet, TransparencyReportViewSet, DashboardStatsView, TransparencySummaryView
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'issues', IssueViewSet, basename='issue')
router.register(r'campaigns', CampaignViewSet, basename='campaign')
router.register(r'donations', DonationViewSet, basename='donation')
router.register(r'transparency', TransparencyReportViewSet, basename='transparency')

urlpatterns = [
    # Authentication
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Dashboard Stats (Private)
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),

    # Transparency Summary (Public) -> THIS WAS MISSING
    path('transparency/summary/', TransparencySummaryView.as_view(), name='transparency-summary'),
    
    # API routes
    path('', include(router.urls)),
]