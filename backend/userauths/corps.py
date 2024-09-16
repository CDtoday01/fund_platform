from django.db import models
from django.conf import settings
from etfs.models import ETF

class Corp(models.Model):
    name = models.CharField(max_length=100, unique=True)
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="created_corps")
    etfs = models.ManyToManyField(ETF, related_name="corp_etfs")
    
    def __str__(self):
        return self.name