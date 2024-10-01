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

from .models import ETF, ETFCategoryType, UserETF
from .serializers import ETFSerializer, UserETFTransactionSerializer
from .permission import IsCreatorOrStaff, IsAdminOrReadOnly

User = get_user_model()

class ETFListView(generics.ListAPIView):
    queryset = ETF.objects.all()
    serializer_class = ETFSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        etfs = super().get_queryset()
        filter_state = self.request.query_params.get("filter_state", None)
        current_time = timezone.now()

        if filter_state == "announcing":
            etfs = etfs.filter(
                announcing_start_date__lte=current_time,
                announcing_end_date__gte=current_time
            )
        elif filter_state == "fundraising":
            etfs = etfs.filter(
                fundraising_start_date__lte=current_time,
                fundraising_end_date__gte=current_time
            )
        
        return etfs

class ETFDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ETF.objects.all()
    serializer_class = ETFSerializer
    def get_permissions(self):
        if self.request.method == "DELETE":
            return [IsAuthenticated(), IsCreatorOrStaff()]
        else:
            return [AllowAny()]

class ETFDefaultsView(APIView):
    serializer_class = ETFSerializer

    def get(self, request):
        now_ISO = timezone.now().isoformat()
        default_values = {
            "etf_type": "全球共享經濟ETF",
            "announcing_start_date": now_ISO,
        }
        print(now_ISO)
        return Response(default_values)

class ETFTypeListAPIView(APIView):
    def get(self, request, *args, **kwargs):
        etf_types = ETFCategoryType.objects.values("category_code", "category", "subcategory_code", "subcategory_name")
        return Response(etf_types)

class CreateETFView(generics.CreateAPIView):
    queryset = ETF.objects.all()
    serializer_class = ETFSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]

    def perform_create(self, serializer):
        user = self.request.user

        # Save the ETF with the creator as the current user
        serializer.save(creator=user)

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        return response
    
class CheckNameExistsView(APIView):
    def get(self, request, *args, **kwargs):
        name = request.query_params.get("name", None)
        if not name:
            return Response({"error": "Name parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

        if ETF.objects.filter(name=name).exists():
            return Response({"exists": True}, status=status.HTTP_200_OK)
        return Response({"exists": False}, status=status.HTTP_200_OK)

class DeleteETFView(generics.DestroyAPIView):
    queryset = ETF.objects.all()
    serializer_class = ETFSerializer
    permission_classes = [IsAuthenticated, IsCreatorOrStaff]
    lookup_field = "id"

    def delete(self, request, *args, **kwargs):
        etf = self.get_object()
        user = request.user

        # Check if the user is the creator of the ETF
        if etf.creator != user:
            return Response({"error": "You do not have permission to delete this ETF."}, status=status.HTTP_403_FORBIDDEN)

        # Check if the ETF has any users
        if etf.users.exists():
            return Response({"error": "Cannot delete ETF. It has associated users."}, status=status.HTTP_400_BAD_REQUEST)

        # Proceed with deletion
        return super().delete(request, *args, **kwargs)

class UserETFsView(generics.ListAPIView):
    serializer_class = ETFSerializer
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
            etfs = ETF.objects.filter(creator=user)
        elif filter_tab == "joined":
            etfs = ETF.objects.filter(useretf__user=user)
        else:
            etfs = ETF.objects.exclude(creator=user).exclude(useretf__user=user)
        
        return self.apply_state_filters(etfs, filter_state, current_time)

    def apply_state_filters(self, etfs, filter_state, current_time):
        if filter_state == "future":
            return etfs.filter(announcing_start_date__gt=current_time)
        elif filter_state == "announcing":
            return etfs.filter(
                announcing_start_date__lte=current_time,
                announcing_end_date__gte=current_time
            )
        elif filter_state == "fundraising":
            return etfs.filter(
                fundraising_start_date__lte=current_time,
                fundraising_end_date__gte=current_time
            )
        elif filter_state == "closed":
            return etfs.filter(fundraising_end_date__lt=current_time)
        elif filter_state == "progressing":
            return self.apply_progressing(etfs, current_time)
        else:
            print("invalid state!")
            etfs = ETF.objects.none()
    
        return etfs.order_by("id")
    
    def apply_progressing(self, user, filter_tab, current_time):
        if filter_tab == "created" or filter_tab == "other":
            etfs = ETF.objects.annotate(
                latest_leave_date=Max("useretf__leave_date")
            ).filter(
                latest_leave_date__gt=current_time
            )
        elif filter_tab == "joined":
            etfs = ETF.objects.filter(
                useretf__user=user,
                useretf__joined_date__lte=current_time,
                useretf__leave_date__gte=current_time
            ).order_by("id")
        # returning empty queryset for an invalid state
        else:
            print("invalid state!")
            etfs = ETF.objects.none()
    
        return etfs.order_by("id")
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request  # Pass the request object for additional context
        return context

class UserETFTransactionListView(generics.ListAPIView):
    serializer_class = UserETFTransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        filter_state = self.request.query_params.get("filter_state")
        useretf = UserETF.objects.filter(user=user)
        
        if filter_state == "fundraising":
            useretf = useretf.filter(leave_date__gte=timezone.now())
        elif filter_state == "closed":
            useretf = useretf.filter(leave_date__lt=timezone.now())
        # return empty queryset for an invalid state
        else:
            print("invalid state!")
            useretf = UserETF.objects.none()

        print(useretf)
        return useretf.select_related('etf').order_by('-joined_date') # Sort by most recent first
    
class JoinETFView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, etf_id):
        user = request.user
        etf = get_object_or_404(ETF, id=etf_id)

        investment_amount = request.data.get("investment_amount")
        if not investment_amount:
            return JsonResponse({"error": "Investment amount is required"}, status=400)

        # Convert investment_amount to integer and validate
        try:
            investment_amount = int(investment_amount)
            if investment_amount < etf.lowest_amount:
                return JsonResponse({"error": f"Investment amount must be at least {etf.lowest_amount}"}, status=400)
            if investment_amount > etf.total_amount:
                return JsonResponse({"error": f"Investment amount exceeds the total amount of {etf.total_amount}"}, status=400)
        except ValueError:
            return JsonResponse({"error": "Invalid investment amount"}, status=400)
        
        # Create a new UserETF instance
        user_etf = UserETF.objects.create(user=user, etf=etf, investment_amount=investment_amount)

        # Update the ETF's total investment
        etf.current_investment += investment_amount
        etf.save()

        # Add the user to the ETF's users set if they haven't joined before
        if not etf.users.filter(id=user.id).exists():
            etf.users.add(user)

        return JsonResponse({"success": "Joined ETF successfully", "user_etf_id": user_etf.id})

class LeaveETFView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, etf_id):
        etf = get_object_or_404(ETF, id=etf_id)
        user = request.user
        
        # Get the UserETF instance associated with this user and ETF
        user_etf_instance = UserETF.objects.filter(user=user, etf=etf).first()

        if not user_etf_instance:
            return Response({"error": "Not a member"}, status=status.HTTP_400_BAD_REQUEST)

        # Retrieve the investment amount directly from the UserETF instance
        investment_amount = user_etf_instance.investment_amount
        
        if investment_amount is None:
            return Response({"error": "Investment amount not found"}, status=status.HTTP_400_BAD_REQUEST)

        # Update the ETF's total investment
        etf.current_investment -= investment_amount
        etf.save()

        # Remove the UserETF instance
        user_etf_instance.delete()

        if UserETF.objects.filter(user=user, etf=etf).count() == 0:
            etf.users.remove(user)  # Remove the user from ETF's users only if they have no instances left

        return Response({"success": "Left ETF successfully"}, status=status.HTTP_200_OK)

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