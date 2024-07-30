from django.urls import path, include
from rest_framework.routers import DefaultRouter
from userauths import views as userauths_views
# from company import views as company_views

from rest_framework_simplejwt.views import TokenRefreshView

# 創建 DefaultRouter 實例
profile_router = DefaultRouter()
# 註冊 ProfileViewSet，URL 前綴為 'profiles'
profile_router.register(r'profiles', userauths_views.ProfileViewSet)

urlpatterns = [
    # 註冊登入 (register/ login / logout)
    path('user/token/', userauths_views.MyTokenObtainPairView.as_view()),                       # 獲取token(refresh, access token)
    path('user/token/refresh', TokenRefreshView.as_view()),                                     # 透過refresh token獲取新的token
    path('user/register/', userauths_views.RegisterView.as_view()),                             # 註冊
    path('user/password-reset/<int:email>/', userauths_views.PasswordResetEmailVerify.as_view()),   # 密碼重設
    path('user/password-change/', userauths_views.PasswordChangeView.as_view()),                # 變更密碼
    path('user/profile/<int:user_id>/', userauths_views.ProfileView.as_view()),                     # 獲取該使用者的檔案(profile)


    # # company engineer-admin
    # path('company/engineer-admin/permiss/', company_views.EngineerAdminPermissView.as_view()),                    # 手動設定工程師信箱權限 
    # path('company/role/', company_views.RoleListAPIView.as_view()),                                               # 獲取所有職位(role)/新增職位
    # path('company/role/<int:role_id>/', company_views.RoleDetailAPIView.as_view()),                                   # 獲取/刪除職位
    # path('company/permiss/', company_views.PermissListAPIView.as_view()),                                         # 獲取全部權限(permiss)/新增權限名稱
    # path('company/permiss/<int:permiss_id>/', company_views.PermissAPIView.as_view()),                                # 獲取/刪除權限
    # path('company/role-permiss/', company_views.RolePermissAPIView.as_view()),                                    # 將權限分配給職位
    # path('company/role-permiss/<int:rolepermiss_id>/', company_views.RolePermissDeleteAPIView.as_view()),             # 刪除該職位的權限
    # path('company/assign-role/', company_views.AssignRoleView.as_view()),                                                 # 將職位分配給使用者(這邊使用者為公司員工，user表中欄位role有職位)
    # path('company/user/', userauths_views.UserListAPIView.as_view()),                                             # 獲取所有使用者 (沒有用到)
    # path('company/search-user/', userauths_views.UserSearchAPIView.as_view()),                                    # 以email搜尋使用者
    # path('company/users-with-role/', company_views.users_with_roles_view),                                        # 獲取所有role欄位非null的使用者(=獲取所有有職位的使用者)
    # path('company/delete/users-with-role/', company_views.ClearUserRoleView.as_view()),                                  # 將使用者的職位移除
    
    # # company admin 
    # path('company/buyer/kyc-form/profiles/', company_views.ProfileListView.as_view()),                            # 有Buyer KYC Reviewing權限的使用者，可以訪問此api，可filter Profile KYC 狀態                          
    # path('company/user/permisses/', company_views.UserPermissesView.as_view()),                                   # 獲取使用者職位的所有權限                        


    # buyer kyc 
    path('buyer/kyc-form/', include(profile_router.urls)),                                                        # KYC表單的CRUD，及後台審核相關的功能
    path('profile-id/<int:user_id>/', userauths_views.get_profile_id),                                                # 獲取該使用者個人檔案的id(profile_id)
    path('user-role/', userauths_views.UserRoleView.as_view()),                                                   # 獲取該使用者腳色 (權限相關)

]
