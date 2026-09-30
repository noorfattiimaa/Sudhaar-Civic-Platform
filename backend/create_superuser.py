"""
Script to create a Django superuser non-interactively
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sudhaar_backend.settings')
django.setup()

from api.models import User

# Create superuser if it doesn't exist
if not User.objects.filter(is_superuser=True).exists():
    email = 'admin@sudhaar.com'
    username = 'admin'
    password = 'admin123'
    
    User.objects.create_superuser(
        email=email,
        username=username,
        password=password,
        first_name='Admin',
        last_name='User',
        role='official'
    )
    print(f"Superuser created successfully!")
    print(f"Email: {email}")
    print(f"Password: {password}")
else:
    print("Superuser already exists!")

