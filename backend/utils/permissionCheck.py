from django.core.exceptions import PermissionDenied, ObjectDoesNotExist
# from company.models import RolePermiss

def check_user_permissions(request, require_permission):
    user_role = request.user.role
    if not user_role:
        raise PermissionDenied("You don't have a role assigned to do this")
    # Check if the required permission exists for the user's role
    # has_permission = RolePermiss.objects.filter(
    #     role = user_role,
    #     permiss__name=require_permission
    # ).exists()
    # if not has_permission:
    #     raise PermissionDenied(f"You don't have {require_permission} permission")

