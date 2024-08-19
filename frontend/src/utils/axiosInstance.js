import axios from 'axios';
import { getToken } from '../utils/getToken';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8000/api/',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
    },
    withCredentials: true,
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        // Add CSRF token from cookies if available
        const csrfToken = document.cookie.match(/csrftoken=([^;]+)/);
        if (csrfToken) {
            config.headers['X-CSRFToken'] = csrfToken[1];
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const { response } = error;
        if (response && response.status === 401) {
            localStorage.removeItem('user'); // Adjust based on your storage method
            const token = getToken();
            if (token){
                localStorage.removeItem('jwtToken');
            }
            
            alert("Session expired. Please log in again.")
            window.location.href = '/login'; // Redirect to login page
            
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
