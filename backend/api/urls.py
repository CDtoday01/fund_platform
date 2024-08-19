from django.urls import path, include
from rest_framework.routers import DefaultRouter
from userauths import views as userauths_views
from rest_framework_simplejwt.views import TokenRefreshView

profile_router = DefaultRouter()

urlpatterns = [
    path('user/token/', userauths_views.MyTokenObtainPairView.as_view()),
    path('user/token/refresh/', TokenRefreshView.as_view()),
    path('user/register/', userauths_views.RegisterView.as_view()),
    path('user/password-reset/<str:email>/', userauths_views.PasswordResetEmailVerify.as_view()),
    path('user/password-change/', userauths_views.PasswordChangeView.as_view()),
]