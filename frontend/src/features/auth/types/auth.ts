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