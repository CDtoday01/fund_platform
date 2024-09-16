from rest_framework.permissions import BasePermission

class IsCreatorOrStaff(BasePermission):
    def has_object_permission(self, request, view, obj):
        # Check if the request method is DELETE
        if request.method == "DELETE":
            # Only allow deletion if the user is the creator or a staff member
            return obj.creator == request.user or request.user.is_staff
        return True

class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in ["DELETE"]:
            return request.user and request.user.is_staff
        return True