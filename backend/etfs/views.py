from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView

from django.utils import timezone
from django.contrib.auth import get_user_model, logout
from django.http import JsonResponse
from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import get_object_or_404
from django.middleware.csrf import get_token

import json

from .models import ETF, UserETF
from .serializers import ETFSerializer
from .permission import IsCreatorOrStaff, IsAdminOrReadOnly

User = get_user_model()

class ETFListView(generics.ListCreateAPIView):
    queryset = ETF.objects.all()
    serializer_class = ETFSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        current_time = timezone.now()
        queryset = ETF.objects.filter(exist_start__lte=current_time, exist_end__gte=current_time)
        
        name = self.request.query_params.get('name', None)
        if name:
            queryset = queryset.filter(name=name)  # Use exact match
        
        return queryset

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

class ETFDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ETF.objects.all()
    serializer_class = ETFSerializer
    def get_permissions(self):
        if self.request.method == 'DELETE':
            return [IsAuthenticated(), IsCreatorOrStaff()]
        else:
            return [AllowAny()]


class ETFDefaultsView(APIView):
    serializer_class = ETFSerializer

    def get(self, request):
        now = timezone.now()
        formatted_now = now.strftime('%Y-%m-%d %H:%M')
        default_values = {
            'name': '',
            'etf_type': '全球共享經濟ETF',
            'fundraising_start': formatted_now,
            'fundraising_end': formatted_now,
            'exist_start': formatted_now,
            'exist_end': formatted_now,
            'currency': '比特幣',
            'roi': 0.5,
        }
        return Response(default_values)

class CreateETFView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    serializer_class = ETFSerializer

    def post(self, request):
        data = request.data
        data['creator'] = request.user.id  # Assign current user's ID to creator field
        serializer = ETFSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DeleteETFView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    serializer_class = ETFSerializer

    def delete(self, request, etf_id):
        etf = get_object_or_404(ETF, id=etf_id)
        etf.delete()
        return Response({'success': 'ETF deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

class UserETFView(generics.ListAPIView):
    serializer_class = ETFSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        filter_tab = self.request.query_params.get('filter_tab', None)
        filter_state = self.request.query_params.get('filter_state', None)
        current_time = timezone.now()

        queryset = ETF.objects.all()

        if filter_tab == 'joined':
            queryset = queryset.filter(useretf__user=self.request.user)
        elif filter_tab == 'other':
            queryset = queryset.exclude(useretf__user=self.request.user)

        if filter_state == 'past':
            queryset = queryset.filter(exist_end__lt=current_time)
        elif filter_state == 'active':
            queryset = queryset.filter(exist_start__lte=current_time, exist_end__gte=current_time)
        elif filter_state == 'future':
            queryset = queryset.filter(exist_start__gt=current_time)

        return queryset

class JoinETFView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, etf_id):
        etf = get_object_or_404(ETF, id=etf_id)
        user = request.user

        # Check if the user has already joined the ETF
        if etf.users.filter(id=user.id).exists():
            return JsonResponse({'error': 'Already joined'}, status=400)

        # Log the creation of UserETF
        UserETF.objects.create(user=user, etf=etf)
        etf.users.add(user)
        return JsonResponse({'success': 'Joined ETF successfully'})

class LeaveETFView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, etf_id):
        etf = get_object_or_404(ETF, id=etf_id)
        user = request.user
        
        if not etf.users.filter(id=user.id).exists():
            return Response({'error': 'Not a member'}, status=status.HTTP_400_BAD_REQUEST)
        
        etf.users.remove(user)
        return Response({'success': 'Left ETF successfully'}, status=status.HTTP_200_OK)

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        print(request.data)
        response = super().post(request, *args, **kwargs)
        csrf_token = get_token(request)
        response.set_cookie('XSRF-TOKEN', csrf_token)
        return response

class RegisterView(View):
    def post(self, request, *args, **kwargs):
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        email = data.get('email')
        
        if not (username and password and email):
            return JsonResponse({'error': 'Missing fields'}, status=400)
        
        if User.objects.filter(username=username).exists():
            return JsonResponse({'error': 'Username already exists'}, status=400)
        
        if User.objects.filter(email=email).exists():
            return JsonResponse({'error': 'Email already exists'}, status=400)

        User.objects.create_user(username=username, password=password, email=email)
        return JsonResponse({'message': 'User created'}, status=201)

class LogoutView(View):
    def post(self, request, *args, **kwargs):
        logout(request)
        return JsonResponse({'success': 'Logged out successfully'})

class CheckAuthView(LoginRequiredMixin, View):
    def get(self, request, *args, **kwargs):
        user = request.user
        return JsonResponse({'authenticated': True, 'user': {'username': user.username}})

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        print('User Object:', user)
        print('User ID:', user.id)
        print('Username:', user.username)
        print('Email:', user.email)
        # print('User is Staff:', user.is_staff)
        # print('User is Superuser:', user.is_superuser)
        return Response({'user_id': user.id, 'username': user.username, 'email': user.email})
