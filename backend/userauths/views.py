from django.conf import settings
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import generics
from rest_framework.permissions import AllowAny
from userauths.models import User
from userauths.serializer import MyTokenObtainPairSerializer, RegisterSerializer, UserSerializer
import random
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

def generate_numeric_otp(length=7):
    return ''.join([str(random.randint(0, 9)) for _ in range(length)])

class PasswordResetEmailVerify(generics.RetrieveAPIView):
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer
    
    def get_object(self):
        email = self.kwargs['email']
        user = User.objects.get(email=email)
        
        if user:
            user.otp = generate_numeric_otp()
            uidb64 = user.pk
            refresh = RefreshToken.for_user(user)
            reset_token = str(refresh.access_token)
            user.reset_token = reset_token
            user.save()

            link = f"http://localhost:5173/create-new-password?otp={user.otp}&uidb64={uidb64}&reset_token={reset_token}"
            merge_data = {'link': link, 'username': user.username}
            subject = "Password Reset Request"
            text_body = render_to_string("email/password_reset.txt", merge_data)
            html_body = render_to_string("email/password_reset.html", merge_data)
            
            msg = EmailMultiAlternatives(subject=subject, from_email=settings.FROM_EMAIL, to=[user.email], body=text_body)
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
        password = payload['password']

        try:
            user = User.objects.get(id=uidb64, otp=otp)
            user.set_password(password)
            user.otp = ""
            user.reset_token = ""
            user.save()
            return Response({"message": "Password changed successfully"}, status=status.HTTP_201_CREATED)
        except User.DoesNotExist:
            return Response({"message": "An error occurred"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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