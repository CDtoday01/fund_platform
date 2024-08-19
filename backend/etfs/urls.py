from django.urls import path
from .views import ETFDefaultsView, ETFListView, CreateETFView, DeleteETFView, ETFDetailView, UserETFView, JoinETFView, LeaveETFView

urlpatterns = [
    path('etfs/', ETFListView.as_view(), name='etf-list'),
    path('etfs/defaults/', ETFDefaultsView.as_view(), name='etf-defaults'),
    path('etfs/create/', CreateETFView.as_view(), name='create-etf'),
    path('etfs/delete/<int:etf_id>/', DeleteETFView.as_view(), name='delete-etf'),
    path('etfs/user/', UserETFView.as_view(), name='user-etfs'),
    path('etfs/join/<int:etf_id>/', JoinETFView.as_view(), name='join-etf'),
    path('etfs/<int:pk>/', ETFDetailView.as_view(), name='etf-detail'),
    path('etfs/<int:etf_id>/join/', JoinETFView.as_view(), name='join_etf'),
    path('etfs/<int:etf_id>/leave/', LeaveETFView.as_view(), name='leave_etf'),
]