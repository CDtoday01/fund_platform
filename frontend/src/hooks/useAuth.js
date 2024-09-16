import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { isAccessTokenExpired, getRefreshToken, setAuthUser, logout } from "../utils/auth"; // Adjust path if necessary
import { useNavigate } from "react-router-dom";

const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    const checkAndRefreshToken = async () => {
        let accessToken = Cookies.get("access_token");

        if (!accessToken) {
            console.warn("No access token found, user is not logged in.");
            navigate("/login"); // Redirect to login page
            setIsAuthenticated(false);
            return;
        }

        if (isAccessTokenExpired(accessToken)) {
            try {
                const tokenData = await getRefreshToken();
                accessToken = tokenData.access;
                setAuthUser(tokenData.access, tokenData.refresh);
            } catch (error) {
                console.error("Failed to refresh token, logging out user:", error);
                logout(); // Log out the user
                navigate("/login"); // Redirect to login page
                setIsAuthenticated(false);
                return;
            }
        }

        setIsAuthenticated(true); // Token is valid or successfully refreshed
    };

    useEffect(() => {
        checkAndRefreshToken();
    }, [navigate]);

    return { isAuthenticated, checkAndRefreshToken };
};

export default useAuth;
