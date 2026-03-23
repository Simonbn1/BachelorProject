import { createBrowserRouter, Navigate } from "react-router-dom";
import TimesheetPage from "../features/timesheets/pages/TimesheetPage.tsx";
import AbsencePage from "../features/absence/pages/AbsencePage.tsx";
import LoginPage from "../features/auth/pages/LoginPage.tsx";
import RegisterPage from "../features/auth/pages/RegisterPage.tsx";
import ProtectedRoute from "../features/auth/components/ProtectedRoute.tsx";

function RootRedirect() {
    const token = localStorage.getItem("accessToken");
    return <Navigate to={token ? "/timesheet" : "/login"} replace />;
}

function FallbackRedirect() {
    const token = localStorage.getItem("accessToken");
    return <Navigate to={token ? "/timesheet" : "/login"} replace />;
}

export const router = createBrowserRouter([
    {
        path: "/",
        element: <RootRedirect />,
    },
    {
        path: "/login",
        element: <LoginPage />,
    },
    {
        path: "/register",
        element: <RegisterPage />,
    },
    {
        path: "/timesheet",
        element: (
            <ProtectedRoute>
                <TimesheetPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/absence",
        element: (
            <ProtectedRoute>
                <AbsencePage />
            </ProtectedRoute>
        ),
    },
    {
        path: "*",
        element: <FallbackRedirect />,
    },
]);