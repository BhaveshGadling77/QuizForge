import axios from "axios";
import { API_BASE } from "@/utils/constants";
axios.defaults.withCredentials = true;
const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Global response error handling
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isLoginRequest = err.config?.url?.includes("/auth/login");

    if (err.response?.status === 401 && !isLoginRequest) {
      console.log("Unauthorized:", err.config.url);

      // Don't redirect immediately
      setTimeout(() => {
        window.location.href = "/";
      }, 800);
    }

    return Promise.reject(err);
  }
);

export default api;