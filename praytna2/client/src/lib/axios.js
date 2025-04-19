import axios from "axios"

const BASE_URL =  process.env.VITE_SERVER;

export const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true
})