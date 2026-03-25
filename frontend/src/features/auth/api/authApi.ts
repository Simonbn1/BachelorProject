import { api } from "../../../shared/api/client";

export const login = async (email: string, password: string) => {
    const response = await api.post("/api/auth/login", {
        email,
        password,
    });

    return response.data;
};

export const register = async (
    displayName: string,
    email: string,
    password: string
) => {
    const response = await api.post("/api/auth/register", {
        displayName,
        email,
        password,
    });

    return response.data;
};