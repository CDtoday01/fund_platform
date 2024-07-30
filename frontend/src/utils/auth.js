import { useAuthStore } from "../store/auth";
import axios from './axios'
import {jwtDecode} from 'jwt-decode'
import Cookies from 'js-cookie'
import Swal from 'sweetalert2'

const Toast = Swal.mixin({
  toast:true,
  position: "top",
  showConfirmButton:false,
  timer:1500,
  timerProgressBar: true
})

export const login = async (email, password) => {
    // console.log(email,password)
    try {
        const {data, status} = await axios.post("user/token/", {
            email,
            password
        })
        if(status === 200){
            setAuthUser(data.access, data.refresh)
            // alert - sign in successfully
            Toast.fire({
                icon:"success",
                title:"Login Successfully"
            })
        }
        return { data, error: null }
    } catch (error) {
        return {
            data: null,
            error: error.response.data?.detail || 'something went wrong!'
        }
    }
}

export const register = async (full_name, email, phone, password, password2) => {
    try {
        const { data } = await axios.post('user/register/', {
            full_name,
            email,
            phone,
            password,
            password2
        })
        await login(email, password)
        // alert - signed up successfully
        Toast.fire({
            icon:"success",
            title:"Register Successfully"
        })
        return { data, error: null }
    } catch (error) {
        console.error(error.response.data) // debug用
        return {
            data: null,
            error: error.response.data?.email || error.response.data?.password || error.response.data?.username || 'Something go wrong'
        }
    }
}

export const logout = () => {
    Cookies.remove("access_token")
    Cookies.remove("refresh_token")
    useAuthStore.getState().setUser(null)
    // alert - signed out successfully
}

export const setUser = async () => {
    const accessToken = Cookies.get("access_token")
    const refreshToken = Cookies.get("refresh_token")
    
    if (!accessToken || !refreshToken) {
        return
    }

    if (isAccessTokenExpired(accessToken)){
       const response = await getRefreshToken()
       setAuthUser(response.access, response.refresh) 
    } else {
        setAuthUser(accessToken, refreshToken)
    }
}

export const setAuthUser = (access_token, refresh_token) => {
    // console.log("Setting access_token in cookie", access_token);
    Cookies.set('access_token', access_token, {
        expires: 4/24,
        // secure: true //生產環境時要true表示 Cookie 只会在 HTTPS 连接中被发送,
        // httpOnly: true // 禁止 JavaScript 訪問 Cookie
    })
    console.log("access_token set successfully")
    
    Cookies.set('refresh_token', refresh_token, {
        expires: 14,
        // secure:true,
        // httpOnly: true // 禁止 JavaScript 訪問 Cookie
    })
    console.log("refresh_token set successfully")

    const user = jwtDecode(access_token) ?? null
    // console.log(666, user)

    if(user) {
        useAuthStore.getState().setUser(user)
    }
    useAuthStore.getState().setLoading(false)
}

export const getRefreshToken = async () => {
    const refresh_token = Cookies.get("refresh_token")
    const response = await axios.post("user/token/refresh/", {
        refresh: refresh_token
    })

    return response.data
}

export const isAccessTokenExpired = (accessToken) => {
    if (!accessToken || typeof accessToken !== 'string') {
        console.error('Invalid token specified: must be a string');
        return true;
    }
    try {
        const decodedToken = jwtDecode(accessToken)
        return decodedToken.exp < Date.now() /1000
    } catch (error) {
        console.log(error)
        return true
    }
}