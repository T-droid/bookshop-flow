import axios from "axios";
import { getAccessToken, refreshAccessToken } from "./tokenManager";


const apiClient = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true, 
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response: any) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthEndpoint = originalRequest.url.includes('/auth');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      try {
        await refreshAccessToken();
        const token  = getAccessToken();
        originalRequest.headers["Authorization"] = `Bearer ${token}`
        return apiClient(originalRequest);
      } catch (error) {
        return Promise.reject(error);
      }
    }
    return Promise.reject(error)
  }
)


export default apiClient;