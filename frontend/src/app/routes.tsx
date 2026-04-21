import { createBrowserRouter, Navigate } from "react-router-dom";
import { TimesheetPage } from "../features/timesheets/pages/TimesheetPage.tsx";
import AbsencePage from "../features/absence/pages/AbsencePage.tsx";
import LoginPage from "../features/auth/pages/LoginPage.tsx";
import RegisterPage from "../features/auth/pages/RegisterPage.tsx";
import EmployeeDashboardPage from "../features/auth/pages/EmployeeDashboardPage.tsx";
import ProtectedRoute from "../features/auth/components/ProtectedRoute.tsx";
import AdminGuard from "../features/admin/components/AdminGuard";
import AdminDashboardPage from "../features/admin/pages/AdminDashboardPage";
import AdminTimesheetsPage from "../features/admin/pages/AdminTimesheetPage";
import AdminEmployeesPage from "../features/admin/pages/AdminEmployeesPage";
import AdminProjectsPage from "../features/admin/pages/AdminProjectsPage";
import SavedTimesheetsPage from "../features/timesheets/pages/SavedTimesheetsPage.tsx";

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
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <EmployeeDashboardPage />
      </ProtectedRoute>
    ),
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
    path: "/timesheets/saved",
    element: (
      <ProtectedRoute>
        <SavedTimesheetsPage />
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
    element: <AdminGuard />,
    children: [
      {
        path: "/admin",
        element: <AdminDashboardPage />,
      },
      {
        path: "/admin/timesheets",
        element: <AdminTimesheetsPage />,
      },
      {
        path: "/admin/export",
        element: <div>Eksport kommer</div>,
      },
      {
        path: "/admin/employees",
        element: <AdminEmployeesPage />,
      },
      {
        path: "/admin/projects",
        element: <AdminProjectsPage />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);
