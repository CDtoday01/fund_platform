from django.urls import path
from .views import ETFDefaultsView, ETFListView, CreateETFView, CheckNameExistsView, DeleteETFView, ETFDetailView, UserETFsView, JoinETFView, LeaveETFView

urlpatterns = [
    path('', ETFListView.as_view(), name='etf-list'),
    path('defaults/', ETFDefaultsView.as_view(), name='etf-defaults'),
    path('create/', CreateETFView.as_view(), name='create-etf'),
    path('check-name-exists/', CheckNameExistsView.as_view(), name='check-name-exists'),
    path('delete/<int:etf_id>/', DeleteETFView.as_view(), name='delete-etf'),
    path('user/', UserETFsView.as_view(), name='user-etfs'),
    path('<int:pk>/', ETFDetailView.as_view(), name='etf-detail'),
    path('<int:etf_id>/join/', JoinETFView.as_view(), name='join_etf'),
    path('<int:etf_id>/leave/', LeaveETFView.as_view(), name='leave_etf'),
]