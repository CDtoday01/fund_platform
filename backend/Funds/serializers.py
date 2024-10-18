from rest_framework import serializers
from .models import FundCategoryType, Fund, UserFund
from django.utils import timezone

class FundCategoryTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = FundCategoryType
        fields = "__all__"

class fundserializer(serializers.ModelSerializer):
    state = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()
    creator = serializers.PrimaryKeyRelatedField(read_only=True)
    subcategory_name = serializers.CharField(source="category.subcategory_name", read_only=True)
    is_fundraising = serializers.SerializerMethodField()
    is_progressing = serializers.SerializerMethodField()
    
    class Meta:
        model = Fund
        fields = "__all__"
        read_only_fields = ["id"]
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Adding custom fields
        self.fields['joined_date'] = serializers.SerializerMethodField()
        self.fields['leave_date'] = serializers.SerializerMethodField()

    def get_state(self, obj):
        current_time = timezone.now()
        if current_time < obj.announcing_start_date:
            return "future"
        elif obj.announcing_start_date <= current_time < obj.announcing_end_date:
            return "announcing"
        elif obj.fundraising_start_date <= current_time <= obj.fundraising_end_date:
            return "fundraising"
        elif obj.fundraising_end_date < current_time:
            return "closed"
        return None
    
    def get_can_delete(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return request.user == obj.creator or request.user.is_staff
        return False
    
    def get_joined_date(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            user_fund = obj.userfund_set.filter(user=request.user).first()
            if user_fund:
                return user_fund.joined_date
        return None 
    
    def get_leave_date(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            user_fund = obj.userfund_set.filter(user=request.user).first()
            if user_fund:
                return user_fund.leave_date
        return None
    
    def get_is_fundraising(self, obj):
        current_time = timezone.now()
        return obj.fundraising_start_date <= current_time <= obj.fundraising_end_date
    
    def get_is_progressing(self, obj):
        # Check if there are any users currently in the Fund
        active_userfunds = obj.userfund_set.filter(leave_date__isnull=True).exists()
        return active_userfunds
    
    def validate(self, data):
        current_time = timezone.now()
        total_amount = data.get("total_amount")
        lowest_amount = data.get("lowest_amount")
        announcing_duration = data.get("announcing_duration")
        fundraising_duration = data.get("fundraising_duration")
        announcing_start_date = data.get("announcing_start_date")
        Fund_duration = data.get("Fund_duration")

        # comment out for debug purpose
        # if announcing_start_date < current_time:
        #     raise serializers.ValidationError({
        #         "date": "announcing start date must be in the future."
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
        if announcing_duration < 7 or announcing_duration > 30:
            raise serializers.ValidationError({
                "announcing_duration": "announcing duration must be between 7 to 30 days."
            })
        if fundraising_duration < 1 or fundraising_duration > 6:
            raise serializers.ValidationError({
                "fundraising_duration": "Fundraising duration must be between 1 to 6 months."
            })
        if Fund_duration < 3 or Fund_duration > 36:
            raise serializers.ValidationError({
                "Fund_duration": "Fund duration must be between 3 to 36 months."
            })
        return data
    
    def create(self, validated_data):
        request = self.context.get("request")  # Access the request object from context
        validated_data["creator"] = request.user  # Ensure creator is set
        return super().create(validated_data)

# class Userfundserializer(serializers.ModelSerializer):
#     fund = fundserializer()  # Serialize the related Fund object

#     class Meta:
#         model = UserFund
#         fields = "__all__"

class UserFundTransactionSerializer(serializers.ModelSerializer):
    fund_name = serializers.CharField(source="fund.name", read_only=True)
    fund_code = serializers.CharField(source="fund.code", read_only=True)
    category_name = serializers.CharField(source="fund.category.subcategory_name", read_only=True)
    duration = serializers.IntegerField(source="fund.Fund_duration", read_only=True)
    is_fundraising = serializers.SerializerMethodField()
    total_amount = serializers.IntegerField(source="fund.total_amount", read_only=True)
    is_progressing = serializers.SerializerMethodField()
    
    class Meta:
        model = UserFund
        fields = "__all__"

    def get_is_fundraising(self, obj):
        now = timezone.now()
        return obj.fund.fundraising_start_date <= now <= obj.fund.fundraising_end_date
    
    def get_is_progressing(self, obj):
        now = timezone.now()
        return obj.leave_date >= now

# class UserFundKnownSerializer(serializers.ModelSerializer):
#     user_username = serializers.CharField(source="user.username")
#     fund_name = serializers.CharField(source="fund.name")

#     class Meta:
#         model = UserFund
#         fields = ["id", "user_username", "fund_name", "joined_date"]

# class UserSerializer(serializers.ModelSerializer):
#     funds = fundserializer(many=True, read_only=True)

#     class Meta:
#         model = User
#         fields = ["id", "username", "funds"]
