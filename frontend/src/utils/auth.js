import { useAuthStore } from "../store/auth";
import axios from './axios';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';

const Toast = Swal.mixin({
  toast: true,
  position: "top",
  showConfirmButton: false,
  timer: 1500,
  timerProgressBar: true
});

export const login = async (email, password) => {
    try {
        const { data, status } = await axios.post("user/token/", {
            email,
            password
        });
        if (status === 200) {
            setAuthUser(data.access, data.refresh);
            Toast.fire({
                icon: "success",
                title: "Login Successfully"
            });
        }
        return { data, error: null };
    } catch (error) {
        return {
            data: null,
            error: error.response?.data?.detail || 'Something went wrong!'
        }
    }
};

export const register = async (full_name, email, phone, password, password2) => {
    try {
        const { data } = await axios.post('user/register/', {
            full_name,
            email,
            phone,
            password,
            password2
        });
        await login(email, password);
        Toast.fire({
            icon: "success",
            title: "Register Successfully"
        });
        return { data, error: null };
    } catch (error) {
        console.error(error.response?.data); // For debugging
        return {
            data: null,
            error: error.response?.data?.email || error.response?.data?.password || 'Something went wrong!'
        }
    }
};

export const logout = () => {
    Cookies.remove("access_token", { path: "/" });
    Cookies.remove("refresh_token", { path: "/" });
    useAuthStore.getState().setUser(null);

    Toast.fire({
        icon: "success",
        title: "Logged out successfully"
    });
};

export const setUser = async () => {
    const accessToken = Cookies.get("access_token");
    const refreshToken = Cookies.get("refresh_token");

    if (!accessToken || !refreshToken) {
        return;
    }

    // If access token is expired, refresh it
    if (!accessToken || isAccessTokenExpired(accessToken)) {
        try {
            const response = await getRefreshToken();
            setAuthUser(response.access, response.refresh);
        } catch (error) {
            // Handle token refresh failure (e.g., refresh token expired)
            console.error('Token refresh failed:', error);
        }
    } else {
        setAuthUser(accessToken, refreshToken);
    }
};

export const setAuthUser = (access_token, refresh_token) => {
    Cookies.set('access_token', access_token, {
        expires: 4 / 24 // 4 hours
    });
    Cookies.set('refresh_token', refresh_token, {
        expires: 14 // 14 days
    });

    const user = jwtDecode(access_token) ?? null;

    if (user) {
        useAuthStore.getState().setUser(user);
    }
    useAuthStore.getState().setLoading(false);
};

export const getRefreshToken = async () => {
    const refresh_token = Cookies.get("refresh_token");
    // If no refresh token is present, return or handle gracefully
    if (!refresh_token) {
        console.error('No refresh token found, user may not be logged in.');
        return null; // or you can throw an error depending on how you want to handle it
    }

    try {
        const response = await axios.post("user/token/refresh/", {
            refresh: refresh_token // Ensure this key matches what the API expects
        });
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 400) {
            console.error('Invalid or expired refresh token.');
            // Optional: log out the user, clear cookies, and reset state
            Cookies.remove("access_token", { path: "/" });
            Cookies.remove("refresh_token", { path: "/" });
            useAuthStore.getState().setUser(null);
            throw new Error('Refresh token is invalid or expired. Please log in again.');
        } else {
            console.error('An unexpected error occurred:', error);
            throw error; // Re-throw other errors
        }
    }
};


export const isAccessTokenExpired = (accessToken) => {
    // If no accessToken is provided, return false to skip token check
    if (accessToken === undefined || accessToken === null) {
        console.log('No access token provided, user is not logged in.');
        return false; // Return false to skip the refresh token logic
    }

    // Ensure that the accessToken is a valid string
    if (typeof accessToken !== 'string') {
        console.log('Invalid access token format.');
        return true;
    }

    try {
        const decodedToken = jwtDecode(accessToken);
        return decodedToken.exp < Date.now() / 1000;
    } catch (error) {
        console.error('Error decoding token:', error);
        return true; // Return true if there's an error decoding the token
    }
};
