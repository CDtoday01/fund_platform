from datetime import datetime
import os
import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from shortuuid.django_fields import ShortUUIDField
from django.db.models.signals import post_save
# from company.models import Role
from django.utils import timezone
from django.conf import settings
from django.core.mail import send_mail
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

class User(AbstractUser):
    username = models.CharField(unique= True, max_length=100)
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=100, null=True,blank=True)
    phone = models.CharField(max_length=100, null=True,blank=True)
    otp = models.CharField(max_length=100, null=True,blank=True)
    reset_token  = models.CharField(max_length=1000, null=True, blank=True)
    # role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email
    
    def save(self, *args, **kwargs):
        email_username, mobile = self.email.split("@")
        if self.full_name == "" or self.full_name ==None:
            self.full_name = email_username
        if self.username == "" or self.username ==None:
            self.username = email_username
        
        super(User, self).save(*args, **kwargs)


def user_directory_path_avatar(instance, filename):
    pid = instance.user.profile.pid  # 獲取使用者的 PID
    date_str = datetime.now().strftime('%Y%m%d_%H%M%S')  # 獲取當前日期和時間作為子文件夾名稱
    ext = os.path.splitext(filename)[1]
    return f'KYCinfo/{pid}/{date_str}/avatar{ext}'

def user_directory_path_self(instance, filename):
    pid = instance.user.profile.pid  # 獲取使用者的 PID
    date_str = datetime.now().strftime('%Y%m%d_%H%M%S')  # 獲取當前日期和時間作為子文件夾名稱
    ext = os.path.splitext(filename)[1]
    return f'KYCinfo/{pid}/{date_str}/self{ext}'

def user_directory_path_first(instance, filename):
    pid = instance.user.profile.pid  # 獲取使用者的 PID
    date_str = datetime.now().strftime('%Y%m%d_%H%M%S')  # 獲取當前日期和時間作為子文件夾名稱
    ext = os.path.splitext(filename)[1]
    return f'KYCinfo/{pid}/{date_str}/first{ext}'

def user_directory_path_first_back(instance, filename):
    pid = instance.user.profile.pid  # 獲取使用者的 PID
    date_str = datetime.now().strftime('%Y%m%d_%H%M%S')  # 獲取當前日期和時間作為子文件夾名稱
    ext = os.path.splitext(filename)[1]
    return f'KYCinfo/{pid}/{date_str}/first_back{ext}'

def user_directory_path_second(instance, filename):
    pid = instance.user.profile.pid  # 獲取使用者的 PID
    date_str = datetime.now().strftime('%Y%m%d_%H%M%S')  # 獲取當前日期和時間作為子文件夾名稱
    ext = os.path.splitext(filename)[1]
    return f'KYCinfo/{pid}/{date_str}/second{ext}'


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    image = models.FileField(upload_to=user_directory_path_avatar, default="default/default-user.jpg", null=True, blank=True)
    about = models.TextField(null=True, blank=True)
    gender = models.CharField(max_length=100, null=True, blank=True)
    state = models.CharField(max_length=100, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    date = models.DateTimeField(auto_now_add= True)
    pid = ShortUUIDField(unique=True, length=16, max_length=20, alphabet="ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789")
    
    # for user kyc
    full_name = models.CharField(max_length=100, null=True, blank=True)
    english_name = models.CharField(max_length=100, null=True, blank=True)
    id_number = models.CharField(max_length=100, null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)
    birthdate = models.DateField(null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    address = models.CharField(max_length=100, null=True, blank=True)
    registered_address = models.CharField(max_length=255, null=True, blank=True)
    self_image = models.FileField(upload_to=user_directory_path_self, null=True, blank=True)
    id_photo_1 = models.FileField(upload_to=user_directory_path_first, null=True, blank=True)
    id_photo_1_back = models.FileField(upload_to=user_directory_path_first_back, null=True, blank=True)
    id_photo_2 = models.FileField(upload_to=user_directory_path_second, null=True, blank=True)
    bank_code = models.CharField(max_length=20, null=True, blank=True)
    bank_account = models.CharField(max_length=50, null=True, blank=True)
    bank_name = models.CharField(max_length=100, null=True, blank=True)
    
    is_confirm_read = models.BooleanField(default=False)

    submit_time = models.DateTimeField(null=True, blank=True)

    PENDING = 'pending'
    REVIEWING = 'reviewing'
    SUPERVISOR_REVIEWING = 'supervisor_reviewing'
    FAIL = 'fail'
    COMPLETE = 'complete'
    STATUS_CHOICES = [
        (PENDING, 'Pending'),
        (REVIEWING, 'Reviewing'),
        (SUPERVISOR_REVIEWING, 'Supervisor Reviewing'),
        (FAIL,'Fail'),
        (COMPLETE, 'Complete')
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDING)
    current_apply_id = models.UUIDField(null=True, blank=True, editable=False)

    def __str__(self):
        if self.full_name:
            return str(self.full_name)
        else:
            return str(self.user.full_name)
    
    def save(self, *args, **kwargs):
        if self.full_name =="" or self.full_name == None:
            self.full_name = self.user.full_name 
        super(Profile, self).save(*args, **kwargs)
  
def create_user_profile(sender, instance, created, **kwargs):  # 創建user時，可以同時創建profile instance
    if created:
        Profile.objects.create(user=instance)
    
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()

post_save.connect(create_user_profile, sender=User)
post_save.connect(save_user_profile, sender=User)


class ReviewRecord(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
    apply_id = models.UUIDField(null=True, blank=True)
    review_stage1 = models.CharField(max_length=100,null=True, blank=True)
    review_person1 = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='review_person1', null=True)
    fail_reason1 = models.TextField(null=True, blank=True)
    timestamp1 = models.DateTimeField(null=True, blank=True)
    review_stage2 = models.CharField(max_length=100,null=True, blank=True)
    review_person2 = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='review_person2', null=True)
    fail_reason2 = models.TextField(null=True, blank=True)
    timestamp2 = models.DateTimeField(null=True, blank=True)

    PASSED = 'passed'
    FAILED = 'failed'
    RESULT_CHOICES = [
        (PASSED, 'Passed'),
        (FAILED, 'Failed')
    ]
    result1 = models.CharField(max_length=10, choices=RESULT_CHOICES, null=True, blank=True)
    result2 = models.CharField(max_length=10, choices=RESULT_CHOICES, null=True, blank=True)

    def __str__(self):
        return f"{self.profile} - {self.review_stage1} - {self.review_person1}"