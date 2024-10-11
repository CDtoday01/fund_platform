import axios from "axios"
import { BASE_URL } from "./constraints"

const apiInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 100000,
    headers: {
        "Content-Type":"application/json",
        Accept:"application/json"
    },
})

export default apiInstance