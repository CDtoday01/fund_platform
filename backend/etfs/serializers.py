from rest_framework import serializers
from .models import ETF, UserETF
from django.contrib.auth.models import User
from dateutil.relativedelta import relativedelta
from django.utils import timezone
from typing import Optional

class ETFSerializer(serializers.ModelSerializer):
    state = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()
    
    class Meta:
        model = ETF
        fields = '__all__'
        read_only_fields = ['id']

    def get_state(self, obj) -> Optional[str]:
        current_time = timezone.now()
        if obj.fundraising_end_date < current_time:
            return 'past'
        elif obj.fundraising_start_date <= current_time <= obj.fundraising_end_date:
            return 'active'
        elif current_time < obj.fundraising_start_date:
            return 'future'
        return None
    
    def get_can_delete(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return request.user == obj.creator or request.user.is_staff
        return False
    
    def validate(self, data):
        total_amount = data.get('total_amount')
        lowest_amount = data.get('lowest_amount')
        announcement_duration = data.get('announcement_duration')
        fundraising_duration = data.get('fundraising_duration')
        announcement_start_date = data.get('announcement_start_date')
        fundraising_start_date = data.get('fundraising_start_date')
        ETF_duration = data.get('ETF_duration')
        
        fundraising_end_date = None
        if fundraising_start_date and fundraising_duration:
            fundraising_end_date = fundraising_start_date + relativedelta(months=fundraising_duration)
        
        if fundraising_end_date <= announcement_start_date:
            raise serializers.ValidationError({
                'date': ' fundraising_start_date must be greater than announcement_start_date.'
            })
        if total_amount < lowest_amount:
            raise serializers.ValidationError({
                'amount': 'total_amount must be greater than or equal to lowest_amount.'
            })
        if announcement_duration < 7 or announcement_duration > 30:
            raise serializers.ValidationError({
                'announcement_duration': 'announcement duration must be between 7 to 30'
            })
        if fundraising_duration < 1 or fundraising_duration > 6:
            raise serializers.ValidationError({
                'fundraising_duration': 'fundraising duration must be between 1 to 6.'
            })
        if ETF_duration < 3 or ETF_duration > 36:
            raise serializers.ValidationError({
                'ETF_duration': 'ETF duration must be between 3 to 36.'
            })
        return data

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
