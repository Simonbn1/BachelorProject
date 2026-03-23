import axios from "axios";
import { getAccessToken, logout } from "../../features/auth/hooks/useAuth";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "",
    withCredentials: false,
});

api.interceptors.request.use((config) => {
    const token = getAccessToken();

    if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            logout();
            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    },
);