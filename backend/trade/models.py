from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

# Create your models here.

class BuyBtc(models.Model):
    date_time = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    side = models.CharField(max_length=10, default="Buy") #Buy, sell or others
    btc_price = models.DecimalField(max_digits=16, decimal_places=8, default=0)
    btc_amount = models.DecimalField(max_digits=16, decimal_places=8, default=0)
    percentage = models.DecimalField(
        max_digits=10, 
        decimal_places=10,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    trigger = models.DecimalField(max_digits=16, decimal_places=8, default=0)
    usdt_total = models.DecimalField(max_digits=16, decimal_places=8, default=0)
    status = models.CharField(max_length=10, default="Ongoing") #sucessful, ongoing or canceled

    def __str__(self):
        return f"(Price: {self.btc_price}, Amount: {self.btc_amount})"
