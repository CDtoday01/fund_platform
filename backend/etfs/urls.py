from django.urls import path
from .views import ETFDefaultsView, ETFListView, ETFTypeListAPIView, CreateETFView, CheckNameExistsView, DeleteETFView, \
                   ETFDetailView, UserETFsView, UserETFTransactionListView, JoinETFView, LeaveETFView


urlpatterns = [
    path("", ETFListView.as_view(), name="etf-list"),                                           # List all ETFs
    path("etf-types/", ETFTypeListAPIView.as_view(), name="get_etf_types"),                     # Get the available ETF (sub)category types
    path("defaults/", ETFDefaultsView.as_view(), name="etf-defaults"),                          # Get the default settings and values for creating an ETF
    path("create/", CreateETFView.as_view(), name="create-etf"),                                # Create a new ETF with settings provided by the user
    path("check-name-exists/", CheckNameExistsView.as_view(), name="check-name-exists"),        # Check if an ETF name already exists when creating a new one
    path("delete/<int:id>/", DeleteETFView.as_view(), name="delete-etf"),                       # Delete an ETF by its ID
    path("user/", UserETFsView.as_view(), name="user-etfs"),                                    # List ETFs associated with the current user
    path("user-etf-transactions/", UserETFTransactionListView.as_view(), name="transactions"),  # List transcations associated with the current user and ETF
    path("<int:pk>/", ETFDetailView.as_view(), name="etf-detail"),                              # View the details of a specific ETF by its primary key (ID)
    path("<int:etf_id>/join/", JoinETFView.as_view(), name="join_etf"),                         # Allow a user to join an ETF by its ID
    path("<int:etf_id>/leave/", LeaveETFView.as_view(), name="leave_etf"),                      # Allow a user to leave an ETF by its ID
    
]