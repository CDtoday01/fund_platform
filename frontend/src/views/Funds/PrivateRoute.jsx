import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/auth";

const PrivateRoute = ({ children }) => {
    const { user } = useAuthStore();
    const location = useLocation();

    return user ? children : <Navigate to="/login" state={{ from: location }} />;
};

export default PrivateRoute;
