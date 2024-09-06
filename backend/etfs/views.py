from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView

from django.db.models import F
from django.utils import timezone
from django.contrib.auth import get_user_model, logout
from django.http import JsonResponse
from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import get_object_or_404
from django.middleware.csrf import get_token

import json

from .models import ETF, ETFCategoryType, UserETF
from .serializers import ETFSerializer
from .permission import IsCreatorOrStaff, IsAdminOrReadOnly

User = get_user_model()

class ETFListView(APIView):
    def get(self, request, *args, **kwargs):
        etfs = ETF.objects.all()
        filter_state = request.query_params.get('filter_state', None)
        tab = request.query_params.get('tab', None)  # Assuming you pass the tab as a query parameter
        current_time = timezone.now()
        user = request.user

        if filter_state == 'future':
            etfs = etfs.filter(announcement_start_date__gt=current_time)
        elif filter_state == 'announcing':
            etfs = etfs.filter(
                announcement_start_date__lte=current_time,
                announcement_end_date__gte=current_time
            )
        elif filter_state == 'fundraising':
            etfs = etfs.filter(
                fundraising_start_date__lte=current_time,
                fundraising_end_date__gte=current_time
            )
        elif filter_state == 'progressing':
            if tab == 'created':
                # Progressing if any user is in the ETF (for created ETFs)
                etfs = etfs.filter(
                    useretf__joined_date__lte=current_time,
                    useretf__leave_date__gte=current_time
                ).distinct()
            elif tab == 'joined':
                # Progressing if the current user is in the ETF (for joined ETFs)
                etfs = etfs.filter(
                    useretf__user=user,
                    useretf__joined_date__lte=current_time,
                    useretf__leave_date__gte=current_time
                ).distinct()
            else:
                # Progressing if any user is in the ETF (for other ETFs)
                etfs = etfs.filter(
                    useretf__joined_date__lte=current_time,
                    useretf__leave_date__gte=current_time
                ).distinct()
        elif filter_state == 'past':
            etfs = etfs.filter(fundraising_end_date__lt=current_time)

        # Serialize the filtered ETFs
        serializer = ETFSerializer(etfs, many=True)
        return Response(serializer.data)

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
        now_ISO = timezone.now().isoformat()
        default_values = {
            'etf_type': '全球共享經濟ETF',
            'announcement_start_date': now_ISO,
        }
        print(now_ISO)
        return Response(default_values)

class ETFTypeListAPIView(APIView):
    def get(self, request, *args, **kwargs):
        etf_types = ETFCategoryType.objects.values('category_code', 'category', 'subcategory_code', 'subcategory_name')
        return Response(etf_types)

class CreateETFView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    serializer_class = ETFSerializer

    def post(self, request):
        data = request.data.copy()  # Make a mutable copy of request data
        data['creator'] = request.user.id  # Assign current user's ID to creator field

        serializer = ETFSerializer(data=data, context={'request': request})  # Pass context
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class CheckNameExistsView(APIView):
    def get(self, request, *args, **kwargs):
        name = request.query_params.get('name', None)
        if not name:
            return Response({'error': 'Name parameter is required'}, status=status.HTTP_400_BAD_REQUEST)

        if ETF.objects.filter(name=name).exists():
            return Response({'exists': True}, status=status.HTTP_200_OK)
        return Response({'exists': False}, status=status.HTTP_200_OK)

class DeleteETFView(generics.DestroyAPIView):
    queryset = ETF.objects.all()
    serializer_class = ETFSerializer
    permission_classes = [IsAuthenticated, IsCreatorOrStaff]
    lookup_field = 'id'

    def delete(self, request, *args, **kwargs):
        etf = self.get_object()
        user = request.user

        # Check if the user is the creator of the ETF
        if etf.creator != user:
            return Response({'error': 'You do not have permission to delete this ETF.'}, status=status.HTTP_403_FORBIDDEN)

        # Check if the ETF has any users
        if etf.users.exists():
            return Response({'error': 'Cannot delete ETF. It has associated users.'}, status=status.HTTP_400_BAD_REQUEST)

        # Proceed with deletion
        return super().delete(request, *args, **kwargs)

class UserETFsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        filter_tab = request.query_params.get('filter_tab', 'joined')
        filter_state = request.query_params.get('filter_state')
        user = request.user

        if filter_tab == 'joined':
            etfs = ETF.objects.filter(users=request.user).annotate(
                joined_date=F('useretf__joined_date'),
                duration=F('ETF_duration')
            )
        elif filter_tab == 'created':
            etfs = ETF.objects.filter(creator=request.user)
        else:
            etfs = ETF.objects.exclude(users=request.user).exclude(creator=request.user)
        
        if filter_tab != 'joined':
            current_time = timezone.now()
            if filter_state == 'future':
                etfs = etfs.filter(announcement_start_date__gt=current_time)
            elif filter_state == 'announcing':
                etfs = etfs.filter(
                    announcement_start_date__lte=current_time,
                    announcement_end_date__gte=current_time
                )
            elif filter_state == 'fundraising':
                etfs = etfs.filter(
                    fundraising_start_date__lte=current_time,
                    fundraising_end_date__gte=current_time
                )
            elif filter_state == 'progressing':
                etfs = etfs.filter(
                    useretf__user=user,
                    useretf__joined_date__lte=current_time,
                    useretf__leave_date__gte=current_time
                )
            elif filter_state == 'past':
                etfs = etfs.filter(fundraising_end_date__lt=current_time)

        serializer = ETFSerializer(etfs, many=True)
        return Response(serializer.data)

class JoinETFView(APIView):
    serializer_class = ETFSerializer
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
    serializer_class = ETFSerializer
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
