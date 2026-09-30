"""
Script to create dummy campaigns for testing
"""
import os
import django
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sudhaar_backend.settings')
django.setup()

from api.models import User, Campaign, BudgetItem

def create_dummy_campaigns():
    """Create dummy campaigns with budget items"""
    
    # Get NGO users
    try:
        green_lahore = User.objects.get(email='greenlahore@ngo.com')
        alkhidmat = User.objects.get(email='alkhidmat@ngo.com')
        tcf = User.objects.get(email='citizensfoundation@ngo.com')
        solar_ngo = User.objects.get(email='solarngo@ngo.com')
    except User.DoesNotExist as e:
        print(f"Error: NGO user not found. Please run create_dummy_users.py first.")
        print(f"Missing user: {e}")
        return
    
    campaigns_data = [
        {
            'title': 'Rehabilitate Gulberg Main Park',
            'description': 'Restoring the walking tracks and installing solar lights for community safety. This project will create a safe space for families to exercise and children to play.',
            'ngo': green_lahore,
            'category': 'Environment',
            'goal_amount': Decimal('500000.00'),
            'raised_amount': Decimal('325000.00'),
            'donor_count': 142,
            'is_verified': True,
            'is_active': True,
            'image_url': 'https://images.unsplash.com/photo-1596230529625-7ee54136652b?auto=format&fit=crop&q=80&w=800',
            'budget_items': [
                {'item_name': 'Solar Lights (x10)', 'total_cost': Decimal('200000.00'), 'funded_amount': Decimal('150000.00')},
                {'item_name': 'Track Repair', 'total_cost': Decimal('150000.00'), 'funded_amount': Decimal('100000.00')},
                {'item_name': 'Labor', 'total_cost': Decimal('100000.00'), 'funded_amount': Decimal('50000.00')},
                {'item_name': 'Plants', 'total_cost': Decimal('50000.00'), 'funded_amount': Decimal('25000.00')},
            ]
        },
        {
            'title': 'Clean Water for Model Town',
            'description': 'Installing a new filtration plant to provide clean drinking water to 500+ households. This will significantly improve health outcomes in the community.',
            'ngo': alkhidmat,
            'category': 'Health',
            'goal_amount': Decimal('800000.00'),
            'raised_amount': Decimal('150000.00'),
            'donor_count': 45,
            'is_verified': True,
            'is_active': True,
            'image_url': 'https://images.unsplash.com/photo-1538300342682-cf57afb97285?auto=format&fit=crop&q=80&w=800',
            'budget_items': [
                {'item_name': 'Filtration Unit', 'total_cost': Decimal('500000.00'), 'funded_amount': Decimal('100000.00')},
                {'item_name': 'Boring & Piping', 'total_cost': Decimal('200000.00'), 'funded_amount': Decimal('50000.00')},
                {'item_name': 'Maintenance Fund', 'total_cost': Decimal('100000.00'), 'funded_amount': Decimal('0.00')},
            ]
        },
        {
            'title': 'Books for Street Children',
            'description': 'Providing textbooks and stationery to 200 underprivileged children in Katchi Abadis. Education is the key to breaking the cycle of poverty.',
            'ngo': tcf,
            'category': 'Education',
            'goal_amount': Decimal('100000.00'),
            'raised_amount': Decimal('50000.00'),
            'donor_count': 89,
            'is_verified': True,
            'is_active': True,
            'image_url': 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800',
            'budget_items': [
                {'item_name': 'Textbooks (x200)', 'total_cost': Decimal('60000.00'), 'funded_amount': Decimal('40000.00')},
                {'item_name': 'Stationery Kits', 'total_cost': Decimal('30000.00'), 'funded_amount': Decimal('10000.00')},
                {'item_name': 'School Bags', 'total_cost': Decimal('10000.00'), 'funded_amount': Decimal('0.00')},
            ]
        },
        {
            'title': 'Fix Street Lights Sector G',
            'description': 'Replacing broken street lights to improve night-time security in Sector G. Well-lit streets reduce crime and accidents.',
            'ngo': solar_ngo,
            'category': 'Civic',
            'goal_amount': Decimal('150000.00'),
            'raised_amount': Decimal('25000.00'),
            'donor_count': 12,
            'is_verified': True,
            'is_active': True,
            'image_url': 'https://images.unsplash.com/photo-1555881400-74d7acaacd81?auto=format&fit=crop&q=80&w=800',
            'budget_items': [
                {'item_name': 'LED Lights (x15)', 'total_cost': Decimal('100000.00'), 'funded_amount': Decimal('20000.00')},
                {'item_name': 'Wiring & Labor', 'total_cost': Decimal('50000.00'), 'funded_amount': Decimal('5000.00')},
            ]
        },
        {
            'title': 'Digital Lab for Govt School',
            'description': 'Equipping the local high school with 10 computers to teach coding skills to underprivileged students. Preparing the next generation for the digital economy.',
            'ngo': tcf,
            'category': 'Education',
            'goal_amount': Decimal('300000.00'),
            'raised_amount': Decimal('92000.00'),
            'donor_count': 67,
            'is_verified': True,
            'is_active': True,
            'image_url': 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800',
            'budget_items': [
                {'item_name': 'Computers (x10)', 'total_cost': Decimal('200000.00'), 'funded_amount': Decimal('60000.00')},
                {'item_name': 'Networking', 'total_cost': Decimal('50000.00'), 'funded_amount': Decimal('30000.00')},
                {'item_name': 'Furniture', 'total_cost': Decimal('50000.00'), 'funded_amount': Decimal('2000.00')},
            ]
        },
        {
            'title': 'Urban Forest & Green Belts',
            'description': 'Planting 500 trees and creating green belts in Sector D to combat smog and urban heat. Improving air quality and community health.',
            'ngo': green_lahore,
            'category': 'Environment',
            'goal_amount': Decimal('500000.00'),
            'raised_amount': Decimal('325000.00'),
            'donor_count': 156,
            'is_verified': True,
            'is_active': True,
            'image_url': 'https://images.unsplash.com/photo-1596230529625-7ee54136652b?auto=format&fit=crop&q=80&w=800',
            'budget_items': [
                {'item_name': 'Saplings (x500)', 'total_cost': Decimal('150000.00'), 'funded_amount': Decimal('150000.00')},
                {'item_name': 'Soil Preparation', 'total_cost': Decimal('150000.00'), 'funded_amount': Decimal('100000.00')},
                {'item_name': 'Gardener Wages', 'total_cost': Decimal('100000.00'), 'funded_amount': Decimal('50000.00')},
                {'item_name': 'Fencing', 'total_cost': Decimal('100000.00'), 'funded_amount': Decimal('25000.00')},
            ]
        },
    ]
    
    created_count = 0
    skipped_count = 0
    
    print("Creating dummy campaigns...")
    print("=" * 50)
    
    for campaign_data in campaigns_data:
        # Check if campaign already exists
        if Campaign.objects.filter(title=campaign_data['title'], ngo=campaign_data['ngo']).exists():
            print(f"[SKIP] Campaign already exists: {campaign_data['title']}")
            skipped_count += 1
            continue
        
        # Extract budget items
        budget_items = campaign_data.pop('budget_items', [])
        
        # Create campaign
        campaign = Campaign.objects.create(**campaign_data)
        created_count += 1
        print(f"[OK] Created campaign: {campaign_data['title']} ({campaign_data['category']})")
        
        # Create budget items
        for item_data in budget_items:
            BudgetItem.objects.create(campaign=campaign, **item_data)
            print(f"  - Budget item: {item_data['item_name']}")
    
    print("=" * 50)
    print(f"Summary:")
    print(f"  Created: {created_count} campaigns")
    print(f"  Skipped: {skipped_count} campaigns (already exist)")
    print("=" * 50)

if __name__ == "__main__":
    create_dummy_campaigns()

