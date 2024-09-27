from django.urls import path
from .views import ETFSearchView

urlpatterns = [
    path("", ETFSearchView.as_view({"get": "list"}), name="search_etf"),
]
