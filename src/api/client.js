
import axios from "axios"

export const api = axios.create({
  baseURL: "https://dummyjson.com",
  timeout: 8000,
})

api.interceptors.request.use(
  (config) => {
    console.log("API Request:", config.url)
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.message)
    return Promise.reject(error)
  }
)
