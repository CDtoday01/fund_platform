from rest_framework import serializers
from .models import ETF, UserETF
from django.contrib.auth.models import User
from dateutil.relativedelta import relativedelta
from django.utils import timezone
from typing import Optional

class ETFSerializer(serializers.ModelSerializer):
    state = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()
    joined_date = serializers.SerializerMethodField()
    end_date = serializers.SerializerMethodField()

    class Meta:
        model = ETF
        fields = '__all__'
        read_only_fields = ['id']

    def get_state(self, obj) -> Optional[str]:
        current_time = timezone.now()
        if current_time < obj.announcement_start_date:
            return 'future'
        elif obj.announcement_start_date <= current_time < obj.announcement_end_date:
            return 'announcing'
        elif obj.fundraising_start_date <= current_time <= obj.fundraising_end_date:
            return 'fundraising'
        elif obj.fundraising_end_date < current_time:
            return 'past'
        return None
    
    def get_can_delete(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return request.user == obj.creator or request.user.is_staff
        return False
    
    def get_joined_date(self, obj):
        return obj.joined_date if hasattr(obj, 'joined_date') else None
    
    def get_end_date(self, obj):
        # Assuming `joined_date` and `duration` are properly annotated in the queryset
        if hasattr(obj, 'joined_date') and obj.joined_date:
            return obj.joined_date + relativedelta(months=obj.duration)
        return None
    
    def validate(self, data):
        current_time = timezone.now()
        total_amount = data.get('total_amount')
        lowest_amount = data.get('lowest_amount')
        announcement_duration = data.get('announcement_duration')
        fundraising_duration = data.get('fundraising_duration')
        announcement_start_date = data.get('announcement_start_date')
        ETF_duration = data.get('ETF_duration')

        if announcement_start_date < current_time:
            raise serializers.ValidationError({
                'date': 'Announcement start date must be in the future.'
            })
        if total_amount < lowest_amount:
            raise serializers.ValidationError({
                'amount': 'Total amount must be greater than or equal to the lowest amount.'
            })
        if announcement_duration < 7 or announcement_duration > 30:
            raise serializers.ValidationError({
                'announcement_duration': 'Announcement duration must be between 7 to 30 days.'
            })
        if fundraising_duration < 1 or fundraising_duration > 6:
            raise serializers.ValidationError({
                'fundraising_duration': 'Fundraising duration must be between 1 to 6 months.'
            })
        if ETF_duration < 3 or ETF_duration > 36:
            raise serializers.ValidationError({
                'ETF_duration': 'ETF duration must be between 3 to 36 months.'
            })
        return data
    
    def create(self, validated_data):
        print(validated_data)
        return ETF.objects.create(**validated_data)  
      
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
