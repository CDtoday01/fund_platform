from rest_framework import serializers

from .models import BuyBtc

class BuyBtcSerializer(serializers.ModelSerializer):
    class Meta:
        model = BuyBtc
        fields = ('btc_price', 'btc_amount', 'usdt_total')