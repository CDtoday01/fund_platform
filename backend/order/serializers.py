from rest_framework import serializers

from .models import BidAsk

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = BidAsk
        fields = ('stock_name', 'bid_price', 'ask_price')