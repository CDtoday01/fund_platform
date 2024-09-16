import axios from "axios";
import { isAccessTokenExpired, setAuthUser, getRefreshToken } from "./auth";
import { BASE_URL } from "./constraints";
import Cookies from "js-cookie";

const useAxios = () => {
    const access_token = Cookies.get("access_token")
    const refresh_token = Cookies.get("refresh_token")

    // Create an axios instance
    const axiosInstance = axios.create({
        baseURL: BASE_URL,
        headers: {
            Accept: "application/json",
            // Conditionally add the Authorization header if the access_token exists
            ...(access_token && { Authorization: `Bearer ${access_token}` }),
        }
    })

    axiosInstance.interceptors.request.use(async (req) => {
        if (!isAccessTokenExpired(access_token)) {
            return req
        }

        try {
            // 調整部分：添加 try-catch 以捕獲並處理刷新 token 錯誤
            const response = await getRefreshToken(refresh_token);
            setAuthUser(response.data.access, response.data.refresh);
            req.headers.Authorization = `Bearer ${response.data.access}`;
        } catch (error) {
            console.error("Failed to refresh token:", error.response ? error.response.data : error.message);
        }
        return req
    })
    return axiosInstance
}

export default useAxios