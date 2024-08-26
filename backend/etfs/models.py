from django.db import models
from django.conf import settings
from django.utils import timezone
from dateutil.relativedelta import relativedelta

class ETF(models.Model):
    name = models.CharField(max_length=100, unique=True)
    etf_type = models.CharField(max_length=50, default="全球共享經濟ETF")
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_etfs')
    
    # New fields based on createETF.js
    total_amount = models.IntegerField()  # Total investment cap
    lowest_amount = models.IntegerField()  # Minimum investment amount
    fundraising_start_date = models.DateTimeField(default=timezone.now)  # Start date of the ETF
    fundraising_end_date = models.DateTimeField(blank=True, null=True)
    fundraising_duration = models.IntegerField() # Duration in months
    announcement_start_date = models.DateTimeField(blank=True, null=True)
    announcement_end_date = models.DateTimeField(blank=True, null=True)
    announcement_duration = models.IntegerField() # Duration in days
    ETF_duration = models.IntegerField()  # Duration in months
    description = models.TextField(blank=True, null=True)  # Description of the ETF

    # Other fields retained
    current_investment = models.IntegerField(default=0)
    users = models.ManyToManyField(settings.AUTH_USER_MODEL, through='UserETF', related_name='etfs')
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.fundraising_start_date and self.fundraising_duration:
            self.fundraising_end_date = self.fundraising_start_date + relativedelta(months=self.fundraising_duration)
        if self.announcement_start_date and self.announcement_duration:
            self.announcement_end_date =  self.announcement_start_date + relativedelta(days=self.announcement_duration)
        super(ETF, self).save(*args, **kwargs)

    def __str__(self):
        return self.name

class UserETF(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    etf = models.ForeignKey(ETF, on_delete=models.CASCADE)
    joined_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'etf')
