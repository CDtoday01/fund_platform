import axios from "axios";
import { isAccessTokenExpired, setAuthUser, getRefreshToken } from "./auth";
import { BASE_URL } from "./constraints";
import Cookies from "js-cookie";

const useAxios = () => {
    const access_token = Cookies.get("access_token")
    const refresh_token = Cookies.get("refresh_token")
    
    const axiosInstance = axios.create({
        baseURL: BASE_URL,
        headers: {
            // 'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${access_token}`,
            
            // Accept 用於指定客戶端希望接收的數據格式。
            // Content-Type 用於指定客戶端發送的數據格式。
            // 當使用 FormData 時，不應手動設置 Content-Type，讓 Axios 或瀏覽器自動處理。
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
            console.error('Failed to refresh token:', error.response ? error.response.data : error.message);
        }
        return req
    })
    return axiosInstance
}

export default useAxios