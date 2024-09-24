from rest_framework import serializers
from .models import ETFCategoryType, ETF, UserETF
from django.utils import timezone

class ETFCategoryTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ETFCategoryType
        fields = "__all__"

class ETFSerializer(serializers.ModelSerializer):
    state = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()
    creator = serializers.PrimaryKeyRelatedField(read_only=True)
    subcategory_name = serializers.CharField(source="category.subcategory_name", read_only=True)
    is_fundraising = serializers.SerializerMethodField()
    is_progressing = serializers.SerializerMethodField()
    class Meta:
        model = ETF
        fields = "__all__"
        read_only_fields = ["id"]
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Adding custom fields
        self.fields['joined_date'] = serializers.SerializerMethodField()
        self.fields['leave_date'] = serializers.SerializerMethodField()

    def get_state(self, obj):
        current_time = timezone.now()
        if current_time < obj.announcement_start_date:
            return "future"
        elif obj.announcement_start_date <= current_time < obj.announcement_end_date:
            return "announcing"
        elif obj.fundraising_start_date <= current_time <= obj.fundraising_end_date:
            return "fundraising"
        elif obj.fundraising_end_date < current_time:
            return "past"
        return None
    
    def get_can_delete(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return request.user == obj.creator or request.user.is_staff
        return False
    
    def get_joined_date(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            user_etf = obj.useretf_set.filter(user=request.user).first()
            if user_etf:
                return user_etf.joined_date
        return None 
    
    def get_leave_date(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            user_etf = obj.useretf_set.filter(user=request.user).first()
            if user_etf:
                return user_etf.leave_date
        return None
    
    def get_is_fundraising(self, obj):
        current_time = timezone.now()
        return obj.fundraising_start_date <= current_time <= obj.fundraising_end_date
    
    def get_is_progressing(self, obj):
        # Check if there are any users currently in the ETF
        active_useretfs = obj.useretf_set.filter(leave_date__isnull=True).exists()
        return active_useretfs
    
    def validate(self, data):
        current_time = timezone.now()
        total_amount = data.get("total_amount")
        lowest_amount = data.get("lowest_amount")
        announcement_duration = data.get("announcement_duration")
        fundraising_duration = data.get("fundraising_duration")
        announcement_start_date = data.get("announcement_start_date")
        ETF_duration = data.get("ETF_duration")

        # comment out for debug purpose
        # if announcement_start_date < current_time:
        #     raise serializers.ValidationError({
        #         "date": "Announcement start date must be in the future."
        #     })
        if total_amount < lowest_amount:
            raise serializers.ValidationError({
                "amount": "Total amount must be greater than or equal to the lowest amount."
            })
        if total_amount < 1000000:
            raise serializers.ValidationError({
                "total_amount": "Total amount must be greater than or equal to 100 (萬)."
            })
        if lowest_amount < 20000:
            raise serializers.ValidationError({
                "lowest_amount": "Lowest amount must be greater than or equal to 2 (萬)."
            })
        if announcement_duration < 7 or announcement_duration > 30:
            raise serializers.ValidationError({
                "announcement_duration": "Announcement duration must be between 7 to 30 days."
            })
        if fundraising_duration < 1 or fundraising_duration > 6:
            raise serializers.ValidationError({
                "fundraising_duration": "Fundraising duration must be between 1 to 6 months."
            })
        if ETF_duration < 3 or ETF_duration > 36:
            raise serializers.ValidationError({
                "ETF_duration": "ETF duration must be between 3 to 36 months."
            })
        return data
    
    def create(self, validated_data):
        request = self.context.get("request")  # Access the request object from context
        validated_data["creator"] = request.user  # Ensure creator is set
        return super().create(validated_data)
      
# class UserETFSerializer(serializers.ModelSerializer):
#     etf = ETFSerializer()  # Serialize the related ETF object

#     class Meta:
#         model = UserETF
#         fields = "__all__"

class UserETFTransactionSerializer(serializers.ModelSerializer):
    etf_name = serializers.CharField(source="etf.name", read_only=True)
    etf_code = serializers.CharField(source="etf.code", read_only=True)
    category_name = serializers.CharField(source="etf.category.subcategory_name", read_only=True)
    duration = serializers.IntegerField(source="etf.ETF_duration", read_only=True)
    is_fundraising = serializers.SerializerMethodField()
    total_amount = serializers.IntegerField(source="etf.total_amount", read_only=True)
    
    class Meta:
        model = UserETF
        fields = "__all__"

    def get_is_fundraising(self, obj):
        now = timezone.now()
        return obj.etf.fundraising_start_date <= now <= obj.etf.fundraising_end_date
    
# class UserETFKnownSerializer(serializers.ModelSerializer):
#     user_username = serializers.CharField(source="user.username")
#     etf_name = serializers.CharField(source="etf.name")

#     class Meta:
#         model = UserETF
#         fields = ["id", "user_username", "etf_name", "joined_date"]

# class UserSerializer(serializers.ModelSerializer):
#     etfs = ETFSerializer(many=True, read_only=True)

#     class Meta:
#         model = User
#         fields = ["id", "username", "etfs"]
