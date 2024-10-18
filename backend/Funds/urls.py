from django.urls import path
from .views import FundDefaultsView, FundListView, FundTypeListAPIView, CreateFundView, CheckNameExistsView, DeleteFundView, \
                   FundDetailView, UserfundsView, UserFundTransactionListView, JoinFundView, LeaveFundView

urlpatterns = [
    path("", FundListView.as_view(), name="fund-list"),                                           # List all funds
    path("fund-types/", FundTypeListAPIView.as_view(), name="get_fund_types"),                     # Get the available Fund (sub)category types
    path("defaults/", FundDefaultsView.as_view(), name="fund-defaults"),                          # Get the default settings and values for creating an Fund
    path("create/", CreateFundView.as_view(), name="create-fund"),                                # Create a new Fund with settings provided by the user
    path("check-name-exists/", CheckNameExistsView.as_view(), name="check-name-exists"),        # Check if an Fund name already exists when creating a new one
    path("delete/<int:id>/", DeleteFundView.as_view(), name="delete-fund"),                       # Delete an Fund by its ID
    path("user/", UserfundsView.as_view(), name="user-funds"),                                    # List funds associated with the current user
    path("user-fund-transactions/", UserFundTransactionListView.as_view(), name="transactions"),  # List transcations associated with the current user and Fund
    path("<int:pk>/", FundDetailView.as_view(), name="fund-detail"),                              # View the details of a specific Fund by its primary key (ID)
    path("<int:fund_id>/join/", JoinFundView.as_view(), name="join_fund"),                         # Allow a user to join an Fund by its ID
    path('transactions/<int:transaction_id>/leave/', LeaveFundView.as_view(), name='leave-fund'), # Allow a user to leave an Fund by its transaction ID
]