"""
Script to create dummy users for testing
Creates: Citizens, NGOs, and Government Officials
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sudhaar_backend.settings')
django.setup()

from api.models import User

def create_dummy_users():
    """Create dummy users for different roles"""
    
    # Dummy Citizens
    citizens = [
        {
            'email': 'ali.khan@example.com',
            'username': 'alikhan',
            'password': 'Ali123!@#',
            'first_name': 'Ali',
            'last_name': 'Khan',
            'phone': '0300-1234567',
            'cnic': '35202-1234567-1',
            'role': 'citizen'
        },
        {
            'email': 'sara.ahmed@example.com',
            'username': 'saraahmed',
            'password': 'Sara456!@#',
            'first_name': 'Sara',
            'last_name': 'Ahmed',
            'phone': '0301-2345678',
            'cnic': '35202-2345678-2',
            'role': 'citizen'
        },
        {
            'email': 'ahmad.hassan@example.com',
            'username': 'ahmadhassan',
            'password': 'Ahmad789!@#',
            'first_name': 'Ahmad',
            'last_name': 'Hassan',
            'phone': '0302-3456789',
            'cnic': '35202-3456789-3',
            'role': 'citizen'
        },
        {
            'email': 'fatima.ali@example.com',
            'username': 'fatimaali',
            'password': 'Fatima123!@#',
            'first_name': 'Fatima',
            'last_name': 'Ali',
            'phone': '0303-4567890',
            'cnic': '35202-4567890-4',
            'role': 'citizen'
        },
        {
            'email': 'muhammad.raza@example.com',
            'username': 'muhammadraza',
            'password': 'Muhammad456!@#',
            'first_name': 'Muhammad',
            'last_name': 'Raza',
            'phone': '0304-5678901',
            'cnic': '35202-5678901-5',
            'role': 'citizen'
        }
    ]
    
    # Dummy NGOs
    ngos = [
        {
            'email': 'greenlahore@ngo.com',
            'username': 'greenlahore',
            'password': 'Green123!@#',
            'first_name': 'Green',
            'last_name': 'Lahore Trust',
            'phone': '0305-6789012',
            'cnic': '35202-6789012-6',
            'role': 'ngo',
            'organization_name': 'Green Lahore Trust',
            'is_verified': True
        },
        {
            'email': 'alkhidmat@ngo.com',
            'username': 'alkhidmat',
            'password': 'AlKhidmat123!@#',
            'first_name': 'Al-Khidmat',
            'last_name': 'Foundation',
            'phone': '0306-7890123',
            'cnic': '35202-7890123-7',
            'role': 'ngo',
            'organization_name': 'Al-Khidmat Foundation',
            'is_verified': True
        },
        {
            'email': 'citizensfoundation@ngo.com',
            'username': 'tcf',
            'password': 'TCF123!@#',
            'first_name': 'The Citizens',
            'last_name': 'Foundation',
            'phone': '0307-8901234',
            'cnic': '35202-8901234-8',
            'role': 'ngo',
            'organization_name': 'The Citizens Foundation',
            'is_verified': True
        },
        {
            'email': 'solarngo@ngo.com',
            'username': 'solarngo',
            'password': 'Solar123!@#',
            'first_name': 'Solar',
            'last_name': 'Energy NGO',
            'phone': '0308-9012345',
            'cnic': '35202-9012345-9',
            'role': 'ngo',
            'organization_name': 'Solar Energy Initiative',
            'is_verified': False
        }
    ]
    
    # Dummy Government Officials
    officials = [
        {
            'email': 'mayor@narowal.gov.pk',
            'username': 'mayor',
            'password': 'Mayor123!@#',
            'first_name': 'City',
            'last_name': 'Mayor',
            'phone': '0309-0123456',
            'cnic': '35202-0123456-0',
            'role': 'official',
            'organization_name': 'Narowal City Council',
            'is_verified': True
        },
        {
            'email': 'wasa@narowal.gov.pk',
            'username': 'wasa_official',
            'password': 'Wasa123!@#',
            'first_name': 'WASA',
            'last_name': 'Official',
            'phone': '0310-1234567',
            'cnic': '35202-1234567-1',
            'role': 'official',
            'organization_name': 'Water and Sanitation Authority',
            'is_verified': True
        },
        {
            'email': 'traffic@narowal.gov.pk',
            'username': 'traffic_police',
            'password': 'Traffic123!@#',
            'first_name': 'Traffic',
            'last_name': 'Police',
            'phone': '0311-2345678',
            'cnic': '35202-2345678-2',
            'role': 'official',
            'organization_name': 'Traffic Police Department',
            'is_verified': True
        }
    ]
    
    created_count = 0
    skipped_count = 0
    
    # Create Citizens
    print("Creating Citizens...")
    for citizen_data in citizens:
        if not User.objects.filter(email=citizen_data['email']).exists():
            User.objects.create_user(**citizen_data)
            print(f"[OK] Created citizen: {citizen_data['email']}")
            created_count += 1
        else:
            print(f"[SKIP] Citizen already exists: {citizen_data['email']}")
            skipped_count += 1
    
    # Create NGOs
    print("\nCreating NGOs...")
    for ngo_data in ngos:
        if not User.objects.filter(email=ngo_data['email']).exists():
            User.objects.create_user(**ngo_data)
            print(f"[OK] Created NGO: {ngo_data['email']} ({ngo_data['organization_name']})")
            created_count += 1
        else:
            print(f"[SKIP] NGO already exists: {ngo_data['email']}")
            skipped_count += 1
    
    # Create Officials
    print("\nCreating Government Officials...")
    for official_data in officials:
        if not User.objects.filter(email=official_data['email']).exists():
            User.objects.create_user(**official_data)
            print(f"[OK] Created official: {official_data['email']} ({official_data['organization_name']})")
            created_count += 1
        else:
            print(f"[SKIP] Official already exists: {official_data['email']}")
            skipped_count += 1
    
    print(f"\n{'='*50}")
    print(f"Summary:")
    print(f"  Created: {created_count} users")
    print(f"  Skipped: {skipped_count} users (already exist)")
    print(f"{'='*50}")
    print("\nAll users have password format: Name123!@#")
    print("Example: Ali Khan -> Ali123!@#")

if __name__ == "__main__":
    create_dummy_users()

