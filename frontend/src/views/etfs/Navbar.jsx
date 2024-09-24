import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import useAxios from "../../utils/useAxios";
import { logout as authLogout } from "../../utils/auth";  // Renaming to avoid conflict with store"s logout

const Navbar = () => {
    const { user, logout } = useAuthStore((state) => ({
        user: state.user,
        logout: state.logout,
    }));

    const navigate = useNavigate();
    const axiosInstance = useAxios();
    const [currentRole, setCurrentRole] = useState(user?.current_role || "individual");
    
    const handleLogout = () => {
        // Call the authLogout to properly clear cookies
        authLogout();  
        logout();  // Clear the store state
        navigate("/login");  // Redirect to login after logout
    };

    return (
        <nav>
            <ul>
                <li><Link to="/">Home</Link></li>
                {user?.username ? (
                    <>
                        <li><Link to="/user/etfs">My ETFs</Link></li>
                        <li><button onClick={handleLogout}>Logout</button></li>
                        <li>Logged in as {user.username}</li>
                    </>
                ) : (
                    <li><Link to="/login">Login</Link></li>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;
