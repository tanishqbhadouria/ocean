import axios from "axios"

const BASE_URL =  "https://ocean-bwcn.onrender.com/api";

export const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true
})