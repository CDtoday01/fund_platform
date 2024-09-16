// Import the "Navigate" component from the "react-router-dom" library.
import { Navigate } from "react-router-dom";

// Import the "useAuthStore" function from a custom "auth" store.
import { useAuthStore } from "../store/auth";
import { useState,useEffect } from "react";
import { usePermissions } from "../RBAC/PermissionContext";

// Define the "PrivateRoute" component as a functional component that takes "children" as a prop.
const PrivateRoute = ({ children, requiredPermission }) => {
    // Use the "useAuthStore" hook to check the user"s authentication status. 
    // It appears to be using a state management solution like "zustand" or "mobx-state-tree".
    const loggedIn = useAuthStore((state) => state.isLoggedIn)();   // 此處不加()調用函數才能讓settings page等等reload正常運作

    // 使用usePermissions hook獲取當前用戶的權限
    const { permissions, loading } = usePermissions()

    console.log("loggedIn:", loggedIn);
    console.log("permissions:", permissions);
    console.log("requiredPermission:", requiredPermission);
    console.log("loading:", loading);


    if (loading) {
        return <div>Loading...</div>;
    }

    // Conditionally render the children if the user is authenticated.
    // If the user is not authenticated, redirect them to the login page.
    // return loggedIn ? <>{children}</> : <Navigate to="/login" />;
    if (!loggedIn) {
        return <Navigate to="/login" />;
      }
    
    // 如果需要的權限未包含在用戶的權限中，重定向到無權限訪問頁面
    if (requiredPermission && !permissions.includes(requiredPermission)) {
        return <Navigate to="/no-access" />;
    }
    
    return <>{children}</>;

};

// Export the "PrivateRoute" component to make it available for use in other parts of the application.
export default PrivateRoute;
