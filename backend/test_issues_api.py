"""
Quick test script to verify issues API
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sudhaar_backend.settings')
django.setup()

from api.models import Issue

total = Issue.objects.count()
active = Issue.objects.exclude(status='Resolved').count()
resolved = Issue.objects.filter(status='Resolved').count()

print(f"Total issues: {total}")
print(f"Active issues: {active}")
print(f"Resolved issues: {resolved}")

if total > 0:
    print("\nSample issues:")
    for issue in Issue.objects.all()[:5]:
        print(f"  - {issue.title} ({issue.status}) - {issue.upvotes} upvotes")

