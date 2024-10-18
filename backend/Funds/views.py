from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView

from django.db.models import F, Max
from django.utils import timezone
from django.contrib.auth import get_user_model, logout
from django.http import JsonResponse
from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import get_object_or_404
from django.middleware.csrf import get_token

import json
from decimal import Decimal

from .models import Fund, FundCategoryType, UserFund
from .serializers import fundserializer, UserFundTransactionSerializer
from .permission import IsCreatorOrStaff, IsAdminOrReadOnly

User = get_user_model()

class FundListView(generics.ListAPIView):
    queryset = Fund.objects.all()
    serializer_class = fundserializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        funds = super().get_queryset()
        filter_state = self.request.query_params.get("filter_state", None)
        show_closed = self.request.query_params.get("show_closed", "false").lower() == "true"
        current_time = timezone.now()

        if filter_state == "announcing":
            funds = funds.filter(
                announcing_start_date__lte=current_time,
                announcing_end_date__gte=current_time
            )
        elif filter_state == "fundraising":
            funds = funds.filter(
                fundraising_start_date__lte=current_time,
                fundraising_end_date__gte=current_time
            )
        
        # Filter based on is_open status
        if not show_closed:
            funds = funds.filter(is_open=True)
        
        return funds

class FundDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Fund.objects.all()
    serializer_class = fundserializer
    def get_permissions(self):
        if self.request.method == "DELETE":
            return [IsAuthenticated(), IsCreatorOrStaff()]
        else:
            return [AllowAny()]

class FundDefaultsView(APIView):
    serializer_class = fundserializer

    def get(self, request):
        now_ISO = timezone.now().isoformat()
        default_values = {
            "announcing_start_date": now_ISO,
        }
        print(now_ISO)
        return Response(default_values)

class FundTypeListAPIView(APIView):
    def get(self, request, *args, **kwargs):
        fund_types = FundCategoryType.objects.values("category_code", "category", "subcategory_code", "subcategory_name")
        return Response(fund_types)

class CreateFundView(generics.CreateAPIView):
    queryset = Fund.objects.all()
    serializer_class = fundserializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]

    def perform_create(self, serializer):
        user = self.request.user

        # Save the Fund with the creator as the current user
        serializer.save(creator=user)

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        return response
    
class CheckNameExistsView(APIView):
    def get(self, request, *args, **kwargs):
        name = request.query_params.get("name", None)
        if not name:
            return Response({"error": "Name parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

        if Fund.objects.filter(name=name).exists():
            return Response({"exists": True}, status=status.HTTP_200_OK)
        return Response({"exists": False}, status=status.HTTP_200_OK)

class DeleteFundView(generics.DestroyAPIView):
    queryset = Fund.objects.all()
    serializer_class = fundserializer
    permission_classes = [IsAuthenticated, IsCreatorOrStaff]
    lookup_field = "id"

    def delete(self, request, *args, **kwargs):
        fund = self.get_object()
        user = request.user

        # Check if the user is the creator of the Fund
        if fund.creator != user:
            return Response({"error": "You do not have permission to delete this Fund."}, status=status.HTTP_403_FORBIDDEN)

        # Check if the Fund has any users
        if fund.users.exists():
            return Response({"error": "Cannot delete Fund. It has associated users."}, status=status.HTTP_400_BAD_REQUEST)

        # Proceed with deletion
        return super().delete(request, *args, **kwargs)

class UserfundsView(generics.ListAPIView):
    serializer_class = fundserializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        filter_tab = self.request.query_params.get("filter_tab")
        filter_state = self.request.query_params.get("filter_state")
        current_time = timezone.now()
        
        # progressing is currently hidden. could be used in later version.
        if filter_state == "progressing":
            return self.apply_progressing(user, filter_tab, current_time)
        else:
            return self.apply_tab_filters(user, filter_tab, filter_state, current_time)

    def apply_tab_filters(self, user, filter_tab, filter_state, current_time):
        if filter_tab == "created":
            funds = Fund.objects.filter(creator=user)
        elif filter_tab == "joined":
            funds = Fund.objects.filter(userfund__user=user)
        else:
            funds = Fund.objects.exclude(creator=user).exclude(userfund__user=user)
        
        return self.apply_state_filters(funds, filter_state, current_time)

    def apply_state_filters(self, funds, filter_state, current_time):
        if filter_state == "future":
            return funds.filter(announcing_start_date__gt=current_time)
        elif filter_state == "announcing":
            return funds.filter(
                announcing_start_date__lte=current_time,
                announcing_end_date__gte=current_time
            )
        elif filter_state == "fundraising":
            return funds.filter(
                fundraising_start_date__lte=current_time,
                fundraising_end_date__gte=current_time
            )
        elif filter_state == "closed":
            return funds.filter(fundraising_end_date__lt=current_time)
        elif filter_state == "progressing":
            # return self.apply_progressing(funds, current_time)
            pass
        else:
            print("invalid state!")
            funds = Fund.objects.none()
    
        return funds.order_by("id")
    
    # # Unused in current version
    # def apply_progressing(self, user, filter_tab, current_time):
    #     if filter_tab == "created" or filter_tab == "other":
    #         funds = Fund.objects.annotate(
    #             latest_leave_date=Max("userfund__leave_date")
    #         ).filter(
    #             latest_leave_date__gt=current_time
    #         )
    #     elif filter_tab == "joined":
    #         funds = Fund.objects.filter(
    #             userfund__user=user,
    #             userfund__joined_date__lte=current_time,
    #             userfund__leave_date__gte=current_time
    #         ).order_by("id")
    #     # returning empty queryset for an invalid state
    #     else:
    #         print("invalid state!")
    #         funds = Fund.objects.none()
    
    #     return funds.order_by("id")
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request  # Pass the request object for additional context
        return context

class UserFundTransactionListView(generics.ListAPIView):
    serializer_class = UserFundTransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        filter_state = self.request.query_params.get("filter_state")
        userfund = UserFund.objects.filter(user=user)

        now = timezone.now()

        if filter_state == "progressing":
            # Filter for progressing funds
            userfund = userfund.filter(leave_date__gte=now)
        elif filter_state == "completed":
            # Filter for closed funds
            userfund = userfund.filter(leave_date__lt=now)
        # Return empty queryset for an invalid state
        else:
            print("invalid state!")
            userfund = UserFund.objects.none()

        return userfund.select_related('fund').order_by('-joined_date') # Sort by most recent first
    
class JoinFundView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, fund_id):
        user = request.user
        fund = get_object_or_404(Fund, id=fund_id)

        investment_amount = request.data.get("investment_amount")
        if not investment_amount:
            return JsonResponse({"error": "Investment amount is required"}, status=400)

        # Convert investment_amount to integer and validate
        try:
            investment_amount = Decimal(investment_amount)
            if investment_amount < fund.lowest_amount:
                return JsonResponse({"error": f"Investment amount must be at least {fund.lowest_amount}"}, status=400)
            if investment_amount > fund.total_amount:
                return JsonResponse({"error": f"Investment amount exceeds the total amount of {fund.total_amount}"}, status=400)
        except ValueError:
            return JsonResponse({"error": "Invalid investment amount"}, status=400)
        
        # Create a new UserFund instance
        user_fund = UserFund.objects.create(user=user, fund=fund, investment_amount=investment_amount)

        # Update the Fund's total investment
        fund.current_investment += investment_amount
        
        # If current investment exceeds total amount, close the Fund
        if fund.current_investment > fund.total_amount:
            fund.is_open = False
        
        fund.save()

        # Add the user to the Fund's users set if they haven't joined before
        if not fund.users.filter(id=user.id).exists():
            fund.users.add(user)

        return JsonResponse({"success": "Joined Fund successfully", "user_fund_id": user_fund.id})

class LeaveFundView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, transaction_id):
        # Get the UserFund instance based on the transaction_id
        user_fund_instance = get_object_or_404(UserFund, id=transaction_id, user=request.user)

        fund = user_fund_instance.fund  # Get the associated Fund
        
        if not user_fund_instance:
            return Response({"error": "Not a member"}, status=status.HTTP_400_BAD_REQUEST)

        # Retrieve the investment amount directly from the UserFund instance
        investment_amount = user_fund_instance.investment_amount
        
        if investment_amount is None:
            return Response({"error": "Investment amount not found"}, status=status.HTTP_400_BAD_REQUEST)

        # Update the Fund's current investment
        fund.current_investment -= investment_amount
        fund.save()

        # Remove the UserFund instance to signify the user has left
        user_fund_instance.delete()

        # Check if the user has any other instances left; if not, remove them from the Fund's users
        if UserFund.objects.filter(user=request.user, fund=fund).count() == 0:
            fund.users.remove(request.user)

        # Check if the Fund can be reopened
        if fund.current_investment <= fund.total_amount:
            fund.is_open = True
            fund.save()  # Save the Fund if we reopen it

        return Response({"success": "Left Fund successfully"}, status=status.HTTP_200_OK)


class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        print(request.data)
        response = super().post(request, *args, **kwargs)
        csrf_token = get_token(request)
        response.set_cookie("XSRF-TOKEN", csrf_token)
        return response

class RegisterView(View):
    def post(self, request, *args, **kwargs):
        data = json.loads(request.body)
        username = data.get("username")
        password = data.get("password")
        email = data.get("email")
        
        if not (username and password and email):
            return JsonResponse({"error": "Missing fields"}, status=400)
        
        if User.objects.filter(username=username).exists():
            return JsonResponse({"error": "Username already exists"}, status=400)
        
        if User.objects.filter(email=email).exists():
            return JsonResponse({"error": "Email already exists"}, status=400)

        User.objects.create_user(username=username, password=password, email=email)
        return JsonResponse({"message": "User created"}, status=201)

class LogoutView(View):
    def post(self, request, *args, **kwargs):
        logout(request)
        return JsonResponse({"success": "Logged out successfully"})

class CheckAuthView(LoginRequiredMixin, View):
    def get(self, request, *args, **kwargs):
        user = request.user
        return JsonResponse({"authenticated": True, "user": {"username": user.username}})

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        print("User Object:", user)
        print("User ID:", user.id)
        print("Username:", user.username)
        print("Email:", user.email)
        # print("User is Staff:", user.is_staff)
        # print("User is Superuser:", user.is_superuser)
        return Response({"user_id": user.id, "username": user.username, "email": user.email})