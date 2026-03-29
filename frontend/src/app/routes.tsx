import { createBrowserRouter, Navigate } from "react-router-dom";
import { TimesheetPage } from "../features/timesheets/pages/TimesheetPage.tsx";
import AbsencePage from "../features/absence/pages/AbsencePage.tsx";
import LoginPage from "../features/auth/pages/LoginPage.tsx";
import RegisterPage from "../features/auth/pages/RegisterPage.tsx";
import ProtectedRoute from "../features/auth/components/ProtectedRoute.tsx";
import AdminGuard from "../features/admin/components/AdminGuard";
import AdminPage from "../features/admin/pages/AdminPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
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
    element: <AdminGuard />,
    children: [
      {
        path: "/admin",
        element: <AdminPage />,
      },
    ],
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
    element: <Navigate to="/login" replace />,
  },
]);
