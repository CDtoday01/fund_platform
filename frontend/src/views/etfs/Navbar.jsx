import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth'; // Ensure correct path

const Navbar = () => {
    const { user, logout } = useAuthStore((state) => ({
        user: state.user,
        logout: state.logout,
    }));
    const navigate = useNavigate(); // Initialize useNavigate

    const handleLogout = () => {
        logout(() => {
            navigate('/'); // Redirect to homepage after logout
        });
    };

    return (
        <nav>
            <ul>
                <li><Link to="/">Home</Link></li>
                {user.username ? (
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
