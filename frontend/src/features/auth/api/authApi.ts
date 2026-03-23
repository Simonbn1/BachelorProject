import { api } from "../../../shared/api/client";
import type { LoginResponse } from "../types/auth";

type AuthRequest = {
    email: string;
    password: string;
    displayName: string;
};

export const login = async (
    email: string,
    password: string
): Promise<LoginResponse> => {
    const res = await api.post("/api/auth/login", { email, password });
    return res.data;
};

export const register = async (
    payload: AuthRequest
): Promise<LoginResponse> => {
    const res = await api.post("/api/auth/register", payload);
    return res.data;
};