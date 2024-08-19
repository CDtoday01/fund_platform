import React from "react";
import { usePermissions } from "./PermissionContext";

const ProtectedComponent = ({ requiredPermission, children}) => {
    const permissions = usePermissions()

    // 檢查用戶是否有所需的權限
    if (!permissions.includes(requiredPermission)) {
        return <div>Access Denied</div>
    }

    return <>{children}</>
}

export default ProtectedComponent