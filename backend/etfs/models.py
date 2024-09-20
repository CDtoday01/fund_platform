from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.validators import MinValueValidator
from dateutil.relativedelta import relativedelta
from datetime import datetime
from corps.models import Corp
import shortuuid
import time

class ETFCategoryType(models.Model):
    category_code = models.CharField(max_length=10)  # Store "種類代碼"
    category = models.CharField(max_length=100)  # Store "種類"
    subcategory_code = models.CharField(max_length=10, unique=True)  # Store "代碼"
    subcategory_name = models.CharField(max_length=100)  # Store "中類名稱"

    def __str__(self):
        return f"{self.category_code} - {self.subcategory_name}"
    
class ETF(models.Model):
    name = models.CharField(max_length=100, unique=True)
    category = models.ForeignKey(ETFCategoryType, on_delete=models.CASCADE, related_name="category_types", to_field="subcategory_code")  # Link to category type
    etf_type = models.CharField(max_length=50, default="全球共享經濟ETF")
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="created_etfs")
    code = models.CharField(max_length=50, blank=True, null=True, unique=True)
    corp = models.ForeignKey(Corp, null=True, blank=True, on_delete=models.CASCADE, related_name="etfs")
    
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

    # Other fields retained
    current_investment = models.IntegerField(default=0)
    users = models.ManyToManyField(settings.AUTH_USER_MODEL, through="UserETF", related_name="etfs")
    created_at = models.DateTimeField(auto_now_add=True)
    
    def is_corp_etf(self):
        return self.corp is not None
    
    def can_be_deleted(self):
        return self.users.count() == 0

    @staticmethod
    def generate_code(subcategory_code):
        if len(subcategory_code) != 2:
            raise ValueError("ETF code must be exactly 2 characters long.")
        timestamp = int(time.time())  # Get current time in seconds since epoch
        unique_id = shortuuid.ShortUUID().random(length=4)  # Adjust length for uniqueness
        return f"{subcategory_code}{timestamp}{unique_id}"

    def save(self, *args, **kwargs):
        # Calculate end dates
        if self.announcement_start_date and self.announcement_duration:
            self.announcement_end_date = self.announcement_start_date + relativedelta(days=self.announcement_duration)
            self.fundraising_start_date = self.announcement_end_date
        if self.fundraising_start_date and self.fundraising_duration:
            self.fundraising_end_date = self.fundraising_start_date + relativedelta(months=self.fundraising_duration)
        
        # Generate code if not already set
        if not self.code:
            self.code = self.generate_code(self.category.subcategory_code)
        
        # Save the instance
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class UserETF(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    etf = models.ForeignKey(ETF, on_delete=models.CASCADE)
    joined_date = models.DateTimeField(default=timezone.now)
    leave_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("user", "etf", "joined_date")

    def save(self, *args, **kwargs):
        if self.joined_date is None:
            raise ValueError("Joined date is not set.")
        
        if self.etf.ETF_duration:
            self.leave_date = self.joined_date + relativedelta(months=self.etf.ETF_duration)
        super().save(*args, **kwargs)