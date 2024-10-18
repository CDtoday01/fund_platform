from django.urls import path
from .views import fundsearchView

urlpatterns = [
    path("", fundsearchView.as_view({"get": "list"}), name="search_fund"),
]
