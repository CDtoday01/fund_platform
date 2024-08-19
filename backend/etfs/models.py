from django.db import models
from django.utils import timezone
from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

class ETF(models.Model):
    name = models.CharField(max_length=100, unique=True)
    etf_type = models.CharField(max_length=50, default="全球共享經濟ETF")
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_etfs')
    fundraising_start = models.DateTimeField(default=timezone.now)
    fundraising_end = models.DateTimeField(default=timezone.now)
    exist_start = models.DateTimeField(default=timezone.now)
    exist_end = models.DateTimeField(default=timezone.now)
    currency = models.CharField(max_length=10, default="比特幣")
    roi = models.DecimalField(max_digits=2, decimal_places=2, default=0.50)
    users = models.ManyToManyField(settings.AUTH_USER_MODEL, through='UserETF', related_name='etfs')

    def clean(self):
        if self.fundraising_end <= self.fundraising_start:
            raise ValidationError({
                'fundraising_end': _('Fundraising end date must be later than the start date.')
            })
        if self.exist_end <= self.exist_start:
            raise ValidationError({
                'exist_end': _('Exist end date must be later than the start date.')
            })

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class UserETF(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    etf = models.ForeignKey(ETF, on_delete=models.CASCADE)
    joined_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'etf')
