from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.validators import MinValueValidator
from dateutil.relativedelta import relativedelta
from datetime import datetime

import shortuuid
import time

class ETFQuerySet(models.QuerySet):
    def progressing(self):
        current_date = datetime.now().date()
        progressing_etfs = []

        # Iterate through ETFs and manually filter based on ETF duration
        for etf in self:
            # Calculate the end date for each user in this ETF
            for user_etf in etf.useretf_set.all():
                end_date = user_etf.joined_date.date() + relativedelta(months=etf.ETF_duration)
                if user_etf.joined_date.date() <= current_date <= end_date:
                    progressing_etfs.append(etf)
                    break

        # Return the filtered ETFs
        return self.filter(id__in=[etf.id for etf in progressing_etfs])

class ETF(models.Model):
    name = models.CharField(max_length=100, unique=True)
    etf_type = models.CharField(max_length=50, default="全球共享經濟ETF")
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_etfs')
    code = models.CharField(max_length=50, unique=True)

    total_amount = models.IntegerField(validators=[MinValueValidator(100)])  # Total investment cap
    lowest_amount = models.IntegerField(validators=[MinValueValidator(2)])  # Minimum investment amount
    announcement_start_date = models.DateTimeField(default=timezone.now)
    announcement_end_date = models.DateTimeField(blank=True, null=True)
    announcement_duration = models.IntegerField()  # Duration in days
    fundraising_start_date = models.DateTimeField()  # Start date of the ETF
    fundraising_end_date = models.DateTimeField(blank=True, null=True)
    fundraising_duration = models.IntegerField()  # Duration in months
    ETF_duration = models.IntegerField()  # Duration in months
    description = models.TextField(max_length=500, blank=True, null=True)  # Description of the ETF

    # Custom QuerySet manager
    objects = ETFQuerySet.as_manager()

    # Other fields retained
    current_investment = models.IntegerField(default=0)
    users = models.ManyToManyField(settings.AUTH_USER_MODEL, through='UserETF', related_name='etfs')
    created_at = models.DateTimeField(auto_now_add=True)

    def can_be_deleted(self):
        return self.users.count() == 0

    @staticmethod
    def generate_code(ETF_type):
        if len(ETF_type) != 2:
            raise ValueError("ETF type must be exactly 2 characters long.")
        timestamp = int(time.time())  # Get current time in seconds since epoch
        unique_id = shortuuid.ShortUUID().random(length=8)  # Adjust length for uniqueness
        return f"{ETF_type.upper()}{timestamp}{unique_id}"

    def save(self, *args, **kwargs):
        # Calculate end dates
        if self.announcement_start_date and self.announcement_duration:
            self.announcement_end_date = self.announcement_start_date + relativedelta(days=self.announcement_duration)
            self.fundraising_start_date = self.announcement_end_date
        if self.fundraising_start_date and self.fundraising_duration:
            self.fundraising_end_date = self.fundraising_start_date + relativedelta(months=self.fundraising_duration)
        
        # Generate code if not already set
        if not self.code:
            self.code = self.generate_code(self.coin_type)
        
        # Save the instance
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class ETFType(models.Model):
    etf_code = models.CharField(max_length=10, unique=True)  # Store "代碼" here
    category_code = models.CharField(max_length=10)  # Store "種類代碼"
    category = models.CharField(max_length=100)  # Store "種類"
    subcategory_name = models.CharField(max_length=100)  # Store "中類名稱"

    def __str__(self):
        return f"{self.etf_code} - {self.subcategory_name}"
    
class UserETF(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    etf = models.ForeignKey(ETF, on_delete=models.CASCADE)
    joined_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'etf')
