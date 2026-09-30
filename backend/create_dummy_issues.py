"""
Script to create dummy issues/cases for testing
"""
import os
import django
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sudhaar_backend.settings')
django.setup()

from api.models import User, Issue, IssueTimeline
from django.utils import timezone
from datetime import timedelta

def create_dummy_issues():
    """Create dummy issues with various statuses and categories"""
    
    # Get some users
    try:
        ali = User.objects.get(email='ali.khan@example.com')
        sara = User.objects.get(email='sara.ahmed@example.com')
        ahmad = User.objects.get(email='ahmad.hassan@example.com')
        fatima = User.objects.get(email='fatima.ali@example.com')
        muhammad = User.objects.get(email='muhammad.raza@example.com')
        mayor = User.objects.get(email='mayor@narowal.gov.pk')
    except User.DoesNotExist as e:
        print(f"Error: User not found. Please run create_dummy_users.py first.")
        print(f"Missing user: {e}")
        return
    
    issues_data = [
        # Active Issues
        {
            'title': 'Deep Pothole Causing Accidents',
            'description': 'Multiple bikers have slipped here. It is right on the turn. Needs immediate filling before more accidents happen.',
            'location': 'Zafarwal Road, Near Main Chowk',
            'category': 'Roads',
            'status': 'In Progress',
            'priority': 'High',
            'author': ali,
            'image_url': 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800',
            'upvotes': 142,
            'latitude': Decimal('31.5204'),
            'longitude': Decimal('74.3587'),
            'created_at': timezone.now() - timedelta(hours=2)
        },
        {
            'title': 'Choked Sewer Line',
            'description': 'Sewage water is entering homes. Reported twice before. The smell is unbearable.',
            'location': 'Siddique Pura, Block A',
            'category': 'Sanitation',
            'status': 'In Progress',
            'priority': 'Medium',
            'author': sara,
            'image_url': 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
            'upvotes': 89,
            'latitude': Decimal('31.5250'),
            'longitude': Decimal('74.3600'),
            'created_at': timezone.now() - timedelta(hours=5)
        },
        {
            'title': 'Broken Street Lights',
            'description': 'All street lights on this road have been non-functional for 2 weeks. Very dangerous at night.',
            'location': 'Model Town, Sector G',
            'category': 'Electricity',
            'status': 'Verified',
            'priority': 'High',
            'author': ahmad,
            'image_url': 'https://images.unsplash.com/photo-1555881400-74d7acaacd81?auto=format&fit=crop&q=80&w=800',
            'upvotes': 156,
            'latitude': Decimal('31.5300'),
            'longitude': Decimal('74.3650'),
            'created_at': timezone.now() - timedelta(days=1)
        },
        {
            'title': 'Water Pipeline Leakage',
            'description': 'Gallons of clean water are being wasted daily. The main supply line needs immediate repair.',
            'location': 'Park Road, Near School',
            'category': 'Water',
            'status': 'Pending',
            'priority': 'High',
            'author': fatima,
            'image_url': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800',
            'upvotes': 67,
            'latitude': Decimal('31.5150'),
            'longitude': Decimal('74.3550'),
            'created_at': timezone.now() - timedelta(days=2)
        },
        {
            'title': 'Garbage Pile Up',
            'description': 'Garbage has not been collected for 5 days. Creating health hazard and attracting stray animals.',
            'location': 'Central Market Area',
            'category': 'Sanitation',
            'status': 'Open',
            'priority': 'Medium',
            'author': muhammad,
            'image_url': 'https://images.unsplash.com/photo-1530587191026-aa1e5327602f?auto=format&fit=crop&q=80&w=800',
            'upvotes': 45,
            'latitude': Decimal('31.5100'),
            'longitude': Decimal('74.3500'),
            'created_at': timezone.now() - timedelta(days=3)
        },
        {
            'title': 'School Boundary Wall Collapsed',
            'description': 'The boundary wall of the government school has collapsed. Students safety is at risk.',
            'location': 'Govt High School No. 1',
            'category': 'Education',
            'status': 'Critical',
            'priority': 'Critical',
            'author': ali,
            'image_url': 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=800',
            'upvotes': 203,
            'latitude': Decimal('31.5400'),
            'longitude': Decimal('74.3700'),
            'created_at': timezone.now() - timedelta(hours=12)
        },
        {
            'title': 'Park Needs Cleanup',
            'description': 'The community park is full of litter and broken equipment. Needs immediate attention.',
            'location': 'Central Park, Block C',
            'category': 'Environment',
            'status': 'Open',
            'priority': 'Low',
            'author': sara,
            'image_url': 'https://images.unsplash.com/photo-1596230529625-7ee54136652b?auto=format&fit=crop&q=80&w=800',
            'upvotes': 34,
            'latitude': Decimal('31.5200'),
            'longitude': Decimal('74.3590'),
            'created_at': timezone.now() - timedelta(days=4)
        },
        {
            'title': 'No Ambulance Access',
            'description': 'Road is too narrow for emergency vehicles. Needs widening for better access.',
            'location': 'Hospital Road, Near Emergency Ward',
            'category': 'Health',
            'status': 'Verified',
            'priority': 'High',
            'author': ahmad,
            'image_url': 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800',
            'upvotes': 98,
            'latitude': Decimal('31.5350'),
            'longitude': Decimal('74.3620'),
            'created_at': timezone.now() - timedelta(days=5)
        },
        
        # Resolved Issues
        {
            'title': 'Road Resurfacing Complete',
            'description': 'The main road pothole has been successfully filled and resurfaced. Traffic flow is restored.',
            'location': 'Lahore Main Blvd',
            'category': 'Roads',
            'status': 'Resolved',
            'priority': 'High',
            'author': mayor,
            'image_url': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800',
            'upvotes': 520,
            'latitude': Decimal('31.5450'),
            'longitude': Decimal('74.3750'),
            'created_at': timezone.now() - timedelta(days=2),
            'resolved_at': timezone.now() - timedelta(days=1),
            'resolved_by': mayor
        },
        {
            'title': 'Park Cleanup Drive Successful',
            'description': 'Volunteers gathered to clean the central park. Over 500kg of waste was collected.',
            'location': 'Central Park',
            'category': 'Environment',
            'status': 'Resolved',
            'priority': 'Low',
            'author': fatima,
            'image_url': 'https://images.unsplash.com/photo-1530587191026-aa1e5327602f?auto=format&fit=crop&q=80&w=800',
            'upvotes': 340,
            'latitude': Decimal('31.5250'),
            'longitude': Decimal('74.3600'),
            'created_at': timezone.now() - timedelta(days=7),
            'resolved_at': timezone.now() - timedelta(days=6),
            'resolved_by': mayor
        },
        {
            'title': 'New Street Lights Installed',
            'description': 'New LED street lights have been installed in Sector 4, improving night-time visibility.',
            'location': 'Sector 4, Main Street',
            'category': 'Electricity',
            'status': 'Resolved',
            'priority': 'Medium',
            'author': muhammad,
            'image_url': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=800',
            'upvotes': 210,
            'latitude': Decimal('31.5300'),
            'longitude': Decimal('74.3650'),
            'created_at': timezone.now() - timedelta(days=14),
            'resolved_at': timezone.now() - timedelta(days=12),
            'resolved_by': mayor
        },
        {
            'title': 'Water Pipe Leakage Fixed',
            'description': 'The main supply line was patched and reinforced. No more water wastage.',
            'location': 'Model Town Block C',
            'category': 'Water',
            'status': 'Resolved',
            'priority': 'High',
            'author': ali,
            'image_url': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800',
            'upvotes': 180,
            'latitude': Decimal('31.5150'),
            'longitude': Decimal('74.3550'),
            'created_at': timezone.now() - timedelta(days=21),
            'resolved_at': timezone.now() - timedelta(days=18),
            'resolved_by': mayor
        },
        {
            'title': 'School Boundary Wall Rebuilt',
            'description': 'The collapsed boundary wall has been reconstructed using community funds, ensuring student safety.',
            'location': 'Govt High School No. 1',
            'category': 'Education',
            'status': 'Resolved',
            'priority': 'High',
            'author': sara,
            'image_url': 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=800',
            'upvotes': 400,
            'latitude': Decimal('31.5400'),
            'longitude': Decimal('74.3700'),
            'created_at': timezone.now() - timedelta(days=30),
            'resolved_at': timezone.now() - timedelta(days=25),
            'resolved_by': mayor
        },
    ]
    
    created_count = 0
    skipped_count = 0
    
    print("Creating dummy issues...")
    print("=" * 50)
    
    for issue_data in issues_data:
        # Check if issue already exists
        if Issue.objects.filter(title=issue_data['title'], location=issue_data['location']).exists():
            print(f"[SKIP] Issue already exists: {issue_data['title']}")
            skipped_count += 1
            continue
        
        # Create issue
        issue = Issue.objects.create(**issue_data)
        created_count += 1
        print(f"[OK] Created issue: {issue_data['title']} ({issue_data['status']})")
        
        # Create timeline entries for resolved issues
        if issue.status == 'Resolved' and issue.resolved_at:
            IssueTimeline.objects.create(
                issue=issue,
                status='Resolved',
                description='Issue has been successfully resolved.',
                created_by=issue.resolved_by
            )
        elif issue.status in ['In Progress', 'Verified']:
            IssueTimeline.objects.create(
                issue=issue,
                status=issue.status,
                description=f'Issue status updated to {issue.status}.',
                created_by=issue.author
            )
    
    print("=" * 50)
    print(f"Summary:")
    print(f"  Created: {created_count} issues")
    print(f"  Skipped: {skipped_count} issues (already exist)")
    print("=" * 50)

if __name__ == "__main__":
    create_dummy_issues()

