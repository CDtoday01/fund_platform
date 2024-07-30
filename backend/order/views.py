from django.shortcuts import render

# import view sets from the REST framework
from rest_framework import viewsets

from .serializers import OrderSerializer

from .models import BidAsk

# Create your views here.
class OrderView(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    queryset = BidAsk.objects.all()