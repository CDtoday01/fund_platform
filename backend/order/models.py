from django.db import models

# Create your models here.

class BidAsk(models.Model):
    stock_name=models.CharField(max_length=50)
    bid_price=models.DecimalField(max_digits=10, decimal_places=2)
    ask_price=models.DecimalField(max_digits=10, decimal_places=2)

    # string representation of the class
    def __str__(self):
 
        #it will return the title
        return f"{self.stock_name} (Bid Price: {self.bid_price}, Ask Price: {self.ask_price})" 