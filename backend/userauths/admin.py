from django.contrib import admin
from userauths.models import Profile, User


class UserAdmin(admin.ModelAdmin): # 使admin後台列表有欄位
    list_display = ['full_name', 'email', 'phone']

class ProfileAdmin(admin.ModelAdmin):
    list_display = ['full_name','current_apply_id', 'gender', 'country']
    # list_editable = ['gender', 'country']
    search_fields = ['full_name', 'date']
    list_filter = ['date']
    readonly_fields = ('current_apply_id',)

admin.site.register(User, UserAdmin)
admin.site.register(Profile, ProfileAdmin)