from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import Sum
from .models import Donation, Campaign

@receiver(post_save, sender=Donation)
@receiver(post_delete, sender=Donation)
def update_campaign_raised_amount(sender, instance, **kwargs):
    campaign = instance.campaign
    if campaign:
        total_raised = Donation.objects.filter(campaign=campaign).aggregate(Sum('amount'))['amount__sum'] or 0
        campaign.raised_amount = total_raised
        campaign.save()