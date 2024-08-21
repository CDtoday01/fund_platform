from rest_framework import serializers
from .models import ETF, UserETF
from django.contrib.auth.models import User
from django.utils import timezone
from typing import Optional

class ETFSerializer(serializers.ModelSerializer):
    state = serializers.SerializerMethodField()
    
    class Meta:
        model = ETF
        fields = '__all__'
        read_only_fields = ['id']

    def get_joined(self, obj):
        user = self.context.get('user')
        return obj.useretf_set.filter(user=user).exists()

    def get_state(self, obj) -> Optional[str]:
        current_time = timezone.now()
        if obj.exist_end < current_time:
            return 'past'
        elif obj.exist_start <= current_time <= obj.exist_end:
            return 'active'
        elif obj.exist_start > current_time:
            return 'future'
        return None

    def validate(self, data):
        fundraising_start = data.get('fundraising_start')
        fundraising_end = data.get('fundraising_end')
        exist_start = data.get('exist_start')
        exist_end = data.get('exist_end')

        if fundraising_end and fundraising_start and fundraising_end <= fundraising_start:
            raise serializers.ValidationError({
                'fundraising_end': 'Fundraising end date must be later than the start date.'
            })
        if exist_end and exist_start and exist_end <= exist_start:
            raise serializers.ValidationError({
                'exist_end': 'Exist end date must be later than the start date.'
            })
        if data.get('roi') < 0 or data.get('roi') > 100:
            raise serializers.ValidationError({
                'roi': 'ROI must be between 0 and 100.'
            })
        return data
    
    def get_user_has_delete_privilege(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return request.user == obj.creator or request.user.is_staff
        return False

class UserETFSerializer(serializers.ModelSerializer):
    etf = ETFSerializer()

    class Meta:
        model = UserETF
        fields = '__all__'

class UserETFKnownSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username')
    etf_name = serializers.CharField(source='etf.name')

    class Meta:
        model = UserETF
        fields = ['id', 'user_username', 'etf_name', 'joined_date']

class UserSerializer(serializers.ModelSerializer):
    etfs = ETFSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'etfs']