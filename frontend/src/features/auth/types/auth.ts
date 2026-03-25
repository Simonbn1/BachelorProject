export type AuthUser = {
    id: number;
    displayName: string;
    email: string;
    roles: string[];
};

export type LoginResponse = {
    accessToken: string;
    expiresInSeconds: number;
    user: AuthUser;
};

const TOKEN_KEY = "accessToken";
const USER_KEY = "authUser";

export function saveAuth(loginResponse: LoginResponse) {
    localStorage.setItem(TOKEN_KEY, loginResponse.accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(loginResponse.user));
}

export function getAccessToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function getAuthUser(): AuthUser | null {
    const rawUser = localStorage.getItem(USER_KEY);

    if (!rawUser) return null;

    try {
        return JSON.parse(rawUser) as AuthUser;
    } catch (error) {
        console.error("Failed to parse auth user", error);
        return null;
    }
}

export function clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}