from django.shortcuts import render

# import view sets from the REST framework
from rest_framework import viewsets

from .serializers import BuyBtcSerializer

from .models import BuyBtc

# Create your views here.
class BuyBtcView(viewsets.ModelViewSet):
    serializer_class = BuyBtcSerializer
    queryset = BuyBtc.objects.all()