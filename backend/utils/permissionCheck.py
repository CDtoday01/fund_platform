from django.core.exceptions import PermissionDenied

def check_user_permissions(request, require_permission):
    user_role = request.user.role
    if not user_role:
        raise PermissionDenied("You don't have a role assigned to do this")