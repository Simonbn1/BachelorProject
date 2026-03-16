import axios from "axios";
import { devAutoLogin } from "../../features/auth/api/authApi.ts";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      localStorage.removeItem("accessToken");
      await devAutoLogin();
      error.config.headers.Authorization = `Bearer ${localStorage.getItem("accessToken")}`;
      return api(error.config);
    }
    return Promise.reject(error);
  },
);
