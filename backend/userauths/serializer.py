from django.contrib.auth.password_validation import validate_password

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
# from company.serializers import RoleSerializer
from userauths.models import Profile, User, ReviewRecord

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['full_name'] = user.full_name
        token['email'] = user.email
        token['username'] = user.username
        try:
            token['vendor_id'] = user.vendor.id
        except:
            token['vendor_id'] = 0

        return token

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ['full_name', 'email', 'phone', 'password','password2']

    def validate(self, attrs):   # attrs 包含了客户端提交的所有数据（经过解析和字段验证后的数据），它是一个字典（dict），其中包含了所有即将用于创建或更新模型实例的字段值。
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password":"Password does not match"})
        return attrs

    def create(self, validated_data):
        email_user, mobile = validated_data['email'].split("@")
        if User.objects.filter(username=email_user).exists():
            raise serializers.ValidationError({"username": "A user with this username already exists"})

        user = User.objects.create(
            full_name=validated_data['full_name'],
            email=validated_data['email'],
            phone=validated_data['phone'],
            username=email_user
        )

        user.set_password(validated_data['password'])
        user.save()
        return user
    # def create(self, validated_data):
    #     user = User.objects.create(
    #         full_name=validated_data['full_name'],
    #         email=validated_data['email'],
    #         phone=validated_data['phone']
    #     )    

    #     email_user, mobile = user.email.split("@")
    #     user.username = email_user
    #     user.set_password(validated_data['password'])

    #     user.save()
    #     return user

class UserSerializer(serializers.ModelSerializer):
    # role = RoleSerializer()  # 嵌套的序列化器
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'username']  # 序列化所需屬性


class UserRoleSerializer(serializers.Serializer):
    role = serializers.CharField()

    
class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = "__all__"

    def to_representation(self, instance):
        response = super().to_representation(instance) # 通過調用父類（也就是 ModelSerializer 的 to_representation 方法）得到 Profile 實例的標準序列化字典，並將其賦值給 response 變數。
        response['user'] = UserSerializer(instance.user).data    # .data 屬性時，DRF 序列化器將模型實例轉換為一個 Python 字典。這個字典包含了序列化後的數據，可以直接用於 JSON 響應或進一步處理。
        return response
    
    # 驗證資料是否有填寫
    def validate(self, data):
        required_fields = [
            'self_image', 'id_photo_1', 'id_photo_1_back', 'id_photo_2',
            'full_name', 'english_name', 'id_number', 'country', 
            'birthdate', 'phone', 'email', 'address', 'registered_address'
        ]
        
        # 檢查所有必填字段
        for field in required_fields:
            if field not in data or data[field] in [None, '']:
                if field in ['self_image', 'id_photo_1', 'id_photo_1_back', 'id_photo_2']:
                    # 檢查文件字段是否存在於 request.FILES 中
                    if field not in self.context['request'].FILES:
                        raise serializers.ValidationError(f"The field {field.replace('_', ' ')} is required.")
                else:
                    raise serializers.ValidationError(f"The field {field.replace('_', ' ')} is required.")
        
        return data
    
class ReviewRecordSerializer(serializers.ModelSerializer):
    review_person1 = UserSerializer()
    review_person2 = UserSerializer()
    class Meta:
        model = ReviewRecord
        fields = '__all__'
    