from rest_framework.decorators import api_view, permission_classes
from django.conf import settings
from django.shortcuts import render
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import generics, viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny

# from company.models import RolePermiss
from userauths.models import User, Profile, ReviewRecord
from userauths.serializer import MyTokenObtainPairSerializer, ProfileSerializer, RegisterSerializer, UserSerializer, ReviewRecordSerializer, UserRoleSerializer

import random
import shortuuid
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from rest_framework.parsers import MultiPartParser
from rest_framework.decorators import action
from django.utils import timezone
import uuid
from django.core.mail import send_mail
from rest_framework.views import APIView
from django.core.exceptions import PermissionDenied
from utils.permissionCheck import check_user_permissions

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
    # def post(self,request):
    #     print(request.data)
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

def generate_otp():
    uuid_key = shortuuid.uuid()
    unique_key = uuid_key[0:6]
    return unique_key

# class PasswordResetEmailVerify(generics.RetrieveAPIView):
#     permission_classes = (AllowAny, )
#     serializer_class = UserSerializer

#     def get_object(self):
#         email = self.kwargs['email']
#         user = User.objects.get(email=email)

#         print("user====", user)
#         if user:
#             user.otp = generate_otp()
#             user.save()

#             uidb64 = user.pk
#             otp = user.otp
#             link = f"http://localhost:5173/create-new-password?otp={otp}&uidb64={uidb64}"
#             print("link ==== ", link)
#         return user
def generate_numeric_otp(length=7):
        # Generate a random 7-digit OTP
        otp = ''.join([str(random.randint(0, 9)) for _ in range(length)])
        return otp

class PasswordResetEmailVerify(generics.RetrieveAPIView):
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer
    
    def get_object(self):
        email = self.kwargs['email']
        user = User.objects.get(email=email)
        
        if user:
            user.otp = generate_numeric_otp()
            uidb64 = user.pk
            
             # Generate a token and include it in the reset link sent via email
            refresh = RefreshToken.for_user(user)
            reset_token = str(refresh.access_token)

            # Store the reset_token in the user model for later verification
            user.reset_token = reset_token
            user.save()

            link = f"http://localhost:5173/create-new-password?otp={user.otp}&uidb64={uidb64}&reset_token={reset_token}"
            
            merge_data = {
                'link': link, 
                'username': user.username, 
            }
            subject = f"Password Reset Request"
            text_body = render_to_string("email/password_reset.txt", merge_data)
            html_body = render_to_string("email/password_reset.html", merge_data)
            
            msg = EmailMultiAlternatives(
                subject=subject, from_email=settings.FROM_EMAIL,
                to=[user.email], body=text_body
            )
            msg.attach_alternative(html_body, "text/html")
            msg.send()
        return user

class PasswordChangeView(generics.CreateAPIView):
    permission_classes = (AllowAny, )
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        payload = request.data

        otp = payload['otp']
        uidb64 = payload['uidb64']
        # reset_token = payload['reset_token']
        password = payload['password']
        
        user = User.objects.get(id=uidb64, otp=otp)
        if user:
            user.set_password(password)
            user.otp=""
            user.reset_token=""
            user.save()
            return Response({"message": "Password change successfully"}, status= status.HTTP_201_CREATED)
        else: 
            return Response({"message:An error occur"}, status= status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        user_id = self.kwargs['user_id']

        user = User.objects.get(id=user_id)
        profile = Profile.objects.get(user=user) 
        return profile
    
class UserListAPIView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return User.objects.all()
    
class UserSearchAPIView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        email = request.GET.get("email")
        if not email:
            return Response({"message": "Email parameter is required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            search_user = User.objects.get(email=email)
            serializer = self.get_serializer(search_user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"message": "User not found."}, status=status.HTTP_404_NOT_FOUND)

# @api_view(['GET'])
# @permission_classes([AllowAny])
# def users_with_roles_view(request):
#     users = User.objects.exclude(role__isnull=True)
#     serializer = UserSerializer(users, many=True)
#     return Response(serializer.data, status=status.HTTP_200_OK)

# @api_view(['POST'])
# @permission_classes([AllowAny])
# def clear_user_role_view(request):
#     user_id = request.data.get('user_id')
#     if not user_id:
#         return Response({"message": "User ID is required"}, status=status.HTTP_400_BAD_REQUEST)
#     try:
#         user = User.objects.get(id=user_id)
#         user.role = None # 將role設定為null
#         user.save()
#         return Response({"message": "Role cleared for user"}, status=status.HTTP_200_OK)
#     except User.DoesNotExist:
#         return Response({"message":"User not found"}, status=status.HTTP_404_NOT_FOUND)

# buyer kyc
class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    parser_classes = [MultiPartParser]     # 讓SWAGGER文件更好讀
    permission_classes = [IsAuthenticated]

    # 公司行政與主管kyc審核: list profile wihch can be filter by status
    def get_queryset(self):
        status_param  = self.request.query_params.get('status')
        if status_param :
            return Profile.objects.filter(status=status_param )
        return Profile.objects.all()

    def perform_update(self, serializer):      # 更新kyc資料後進行公司審核status 改為reviewing
        profile = self.get_object()
        if profile.status != Profile.REVIEWING:
            profile.status = Profile.REVIEWING
        serializer.save(status=Profile.REVIEWING)

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        return Response(ProfileSerializer(self.get_object()).data, status=status.HTTP_200_OK)
    
    def notify_admins(self, profile): # 通知行政審核
        admins = User.objects.filter(role__name='行政')
        for admin in admins:
            send_mail(
                'KYC審核通知',
                f'會員{profile.full_name}({profile.email})的KYC需要行政審核',
                settings.EMAIL_HOST_USER,
                [admin.email]
            )
    
    def notify_supervisors(self, profile): # 通知主管審核
        supervisors = User.objects.filter(role__name='主管')
        for supervisor in supervisors:
            send_mail(
                'KYC審核通知',
                f'會員{profile.full_name}({profile.email})的KYC需要主管審核',
                settings.EMAIL_HOST_USER,
                [supervisor.email]
            )
    
    def notify_user(self, profile, message):
        send_mail(
            'KYC審核結果通知',
            f'會員 {profile.full_name}，{message}。',
            settings.EMAIL_HOST_USER,
            [profile.email],
        )

    @action(detail=True, methods=['post'])  # 使用者重新申請審核 (設定於表單送出)
    def new_apply(self, request, pk=None):
        profile = self.get_object()
        profile.current_apply_id = uuid.uuid4()
        profile.status = Profile.REVIEWING
        profile.save()
        self.notify_admins(profile)
        return Response({'status': 'new application started', 'current_apply_id': profile.current_apply_id}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])  # 使用者重新申請審核 (設定於表單送出)
    def change_status_to_pending(self, request, pk=None):
        profile = self.get_object()
        profile.status = Profile.PENDING
        profile.save()

        return Response({'status': 'Re-apply application started'}, status=status.HTTP_200_OK)
    
    # def check_user_permissions(self, request, required_permission):  放到utils資料夾好維護
    #     try:
    #         user_role = request.user.role
    #         if not user_role:
    #             raise PermissionError('您沒有角色分配，無法進行此操作')

    #         # Check if the required permission exists for the user's role
    #         has_permission = RolePermiss.objects.filter(
    #             role=user_role,
    #             permiss__name=required_permission
    #         ).exists()

    #         if not has_permission:
    #             raise PermissionError(f'您沒有{required_permission}權限')
    #     except Exception as e:
    #         raise PermissionError(f'權限檢查時發生錯誤: {str(e)}')
        
    @action(detail=True, methods=['patch'])
    def approve(self, request, pk=None): # 行政審核通過
        # try:
            # self.check_user_permissions(request, 'Buyer KYC Reviewing')
            check_user_permissions(request, 'Buyer KYC Reviewing')
            profile = self.get_object()
            review_person = request.user
            review_time = timezone.now()

            existing_record = ReviewRecord.objects.filter(profile=profile, apply_id=profile.current_apply_id).first()
            if existing_record:
                existing_record.review_stage1 = '行政審核'
                existing_record.review_person1 = review_person
                existing_record.result1 = ReviewRecord.PASSED
                existing_record.timestamp1 = review_time
                existing_record.save()
            else:
                ReviewRecord.objects.create(
                    profile=profile,
                    apply_id=profile.current_apply_id,
                    review_stage1='行政審核',
                    review_person1=review_person,
                    result1=ReviewRecord.PASSED,
                    timestamp1=review_time
                )
            profile.status = Profile.SUPERVISOR_REVIEWING
            profile.save()
            self.notify_supervisors(profile)
            return Response({'status': 'approved'}, status=status.HTTP_200_OK)
        # except PermissionDenied as e:                                              # 其實這邊可以不用try except了，我有middleware，果這邊寫return 就會回傳這邊的錯誤訊息
        #     return Response({'detail': str(e)}, status=status.HTTP_403_FORBIDDEN)
        # except Exception as e:
        #     return Response({'detail': f'An error occurred during the review process: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    @action(detail=True, methods=['patch'])
    def disapprove(self, request, pk=None): # 行政審核不通過
        check_user_permissions(request, 'Buyer KYC Reviewing')
        profile = self.get_object()
        review_person = request.user
        review_time = timezone.now()
        reason = request.data.get('reason', '')

        existing_record = ReviewRecord.objects.filter(profile=profile, apply_id=profile.current_apply_id).first()
        if existing_record:
            existing_record.review_stage1 = '行政審核'
            existing_record.review_person1 = review_person
            existing_record.fail_reason1 = reason
            existing_record.result1 = ReviewRecord.FAILED
            existing_record.timestamp1 = review_time
            existing_record.save()
        else:
            ReviewRecord.objects.create(
                profile=profile,
                apply_id=profile.current_apply_id,
                review_stage1='行政審核',
                review_person1=review_person,
                fail_reason1=reason,
                result1=ReviewRecord.FAILED,
                timestamp1=review_time
            )
        profile.status = Profile.FAIL
        profile.save()
        self.notify_user(profile, '您的資料未通過審核')
        return Response({'status': 'disapproved'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'])
    def supervisor_approve(self, request, pk=None): # 主管審核通過
        check_user_permissions(request, 'Buyer KYC Reviewing (Supervisor)')
        profile = self.get_object()
        review_person = request.user
        review_time = timezone.now()

        existing_record = ReviewRecord.objects.filter(profile=profile, apply_id=profile.current_apply_id).first()
        if existing_record:
            existing_record.review_stage2 = '主管審核'
            existing_record.review_person2 = review_person
            existing_record.result2 = ReviewRecord.PASSED
            existing_record.timestamp2 = review_time
            existing_record.save()
        else:
            ReviewRecord.objects.create(
                profile=profile,
                apply_id=profile.current_apply_id,
                review_stage2='主管審核',
                review_person2=review_person,
                result2=ReviewRecord.PASSED,
                timestamp2=review_time
            )
        profile.status = Profile.COMPLETE
        profile.save()
        self.notify_user(profile, '您的資料通過審核')
        return Response({'status': 'supervisor approved'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'])
    def supervisor_disapprove(self, request, pk=None): # 主管審核不通過
        check_user_permissions(request, 'Buyer KYC Reviewing (Supervisor)')
        profile = self.get_object()
        review_person = request.user
        review_time = timezone.now()
        reason = request.data.get('reason', '')

        existing_record = ReviewRecord.objects.filter(profile=profile, apply_id=profile.current_apply_id).first()
        if existing_record:
            existing_record.review_stage2 = '主管審核'
            existing_record.review_person2 = review_person
            existing_record.fail_reason2 = reason
            existing_record.result2 = ReviewRecord.FAILED
            existing_record.timestamp2 = review_time
            existing_record.save()
        else:
            ReviewRecord.objects.create(
                profile=profile,
                apply_id=profile.current_apply_id,
                review_stage2='主管審核',
                review_person2=review_person,
                fail_reason2=reason,
                result2=ReviewRecord.FAILED,
                timestamp2=review_time
            )
        profile.status = Profile.FAIL
        profile.save()
        self.notify_user(profile, '您的資料未通過審核')
        return Response({'status': 'supervisor disapproved'}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'])  # 獲取指定 profile 的審核記錄
    def review_records(self, request, pk=None):
        review_records = ReviewRecord.objects.filter(profile_id=pk)
        serializer = ReviewRecordSerializer(review_records, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

def get_profile_id(request, user_id):  # 由使用者id推出profie_id
    profile = get_object_or_404(Profile, user_id=user_id)
    return JsonResponse({'profile_id': profile.id})

class UserRoleView(generics.GenericAPIView): # get 使用者的role (方便公司後台腳色權限)
    permission_classes = [IsAuthenticated]
    serializer_class = UserRoleSerializer
    
    def get(self, request, *args, **kwargs):
        user = request.user
        role = user.role.name
        serializer = self.get_serializer({'role': role})
        return Response(serializer.data, status=status.HTTP_200_OK)