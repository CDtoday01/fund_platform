from django.db import models
from django.conf import settings
from django.utils import timezone
from dateutil.relativedelta import relativedelta
import shortuuid
import time

class FundCategoryType(models.Model):
    category_code = models.CharField(max_length=10)  # Store "種類代碼"
    category = models.CharField(max_length=100)  # Store "種類"
    subcategory_code = models.CharField(max_length=10, unique=True)  # Store "代碼"
    subcategory_name = models.CharField(max_length=100)  # Store "中類名稱"

    def __str__(self):
        return f"{self.category_code} - {self.subcategory_name}"
    
class Fund(models.Model):
    name = models.CharField(max_length=100, unique=True)
    category = models.ForeignKey(FundCategoryType, on_delete=models.CASCADE, related_name="category_types", to_field="subcategory_code")  # Link to category type
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="created_funds")
    code = models.CharField(max_length=50, blank=True, null=True, unique=True)
    
    total_amount = models.IntegerField()  # Total investment cap
    lowest_amount = models.IntegerField()  # Minimum investment amount
    is_open = models.BooleanField(default=True)
    announcing_start_date = models.DateTimeField(default=timezone.now)
    announcing_end_date = models.DateTimeField(blank=True, null=True)
    announcing_duration = models.IntegerField()  # Duration in days
    fundraising_start_date = models.DateTimeField()
    fundraising_end_date = models.DateTimeField(blank=True, null=True)
    fundraising_duration = models.IntegerField()  # Duration in months
    Fund_duration = models.IntegerField()  # Duration in months
    description = models.TextField(max_length=500, blank=True, null=True)  # Description of the Fund
    
    # Other fields retained
    current_investment = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    users = models.ManyToManyField(settings.AUTH_USER_MODEL, through="UserFund", related_name="funds")
    created_at = models.DateTimeField(auto_now_add=True)
    
    def can_be_deleted(self):
        return self.users.count() == 0

    @staticmethod
    def generate_code(subcategory_code):
        if len(subcategory_code) != 2:
            raise ValueError("Fund code must be exactly 2 characters long.")
        timestamp = int(time.time())  # Get current time in seconds since epoch
        unique_id = shortuuid.ShortUUID().random(length=4)  # Adjust length for uniqueness
        return f"{subcategory_code}{timestamp}{unique_id}"

    def save(self, *args, **kwargs):
        # Calculate end dates
        if self.announcing_start_date and self.announcing_duration:
            self.announcing_end_date = self.announcing_start_date + relativedelta(days=self.announcing_duration)
            self.fundraising_start_date = self.announcing_end_date
        if self.fundraising_start_date and self.fundraising_duration:
            self.fundraising_end_date = self.fundraising_start_date + relativedelta(months=self.fundraising_duration)
        
        # Generate code if not already set
        if not self.code:
            self.code = self.generate_code(self.category.subcategory_code)
        
        self.is_open = self.current_investment < self.total_amount
        
        # Save the instance
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class UserFund(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    fund = models.ForeignKey(Fund, on_delete=models.CASCADE)
    transaction_number = models.CharField(max_length=15, unique=True)
    joined_date = models.DateTimeField(default=timezone.now)
    leave_date = models.DateTimeField(null=True, blank=True)
    investment_amount = models.IntegerField(default=0)
    
    class Meta:
        unique_together = ("user", "fund", "joined_date")
        
    @staticmethod
    def generate_number():
        timestamp = int(time.time())  # Get current time in seconds since epoch
        unique_id = shortuuid.ShortUUID().random(length=4)  # Adjust length for uniqueness
        return f"{timestamp}{unique_id}"

    def save(self, *args, **kwargs):
        if self.joined_date is None:
            raise ValueError("Joined date is not set.")
        
        if self.fund.Fund_duration:
            self.leave_date = self.joined_date + relativedelta(months=self.fund.Fund_duration)
        
        if not self.transaction_number:
            self.transaction_number = self.generate_number()
        
        super().save(*args, **kwargs)