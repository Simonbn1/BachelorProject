import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

type ProtectedRouteProps = {
    children: ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const token = localStorage.getItem("accessToken");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}