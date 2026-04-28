import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "./AppLayout";
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
import AdminExportPage from "../features/admin/pages/AdminExportPage.tsx";
import SettingsPage from "../features/settings/pages/SettingsPage.tsx";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },

  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "/dashboard", element: <EmployeeDashboardPage /> },
      { path: "/timesheet", element: <TimesheetPage /> },
      { path: "/timesheets/saved", element: <SavedTimesheetsPage /> },
      { path: "/absence", element: <AbsencePage /> },
      { path: "/settings", element: <SettingsPage /> },
    ],
  },

  {
    element: <AdminGuard />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/admin", element: <AdminDashboardPage /> },
          { path: "/admin/timesheets", element: <AdminTimesheetsPage /> },
          { path: "/admin/export", element: <AdminExportPage /> },
          { path: "/admin/employees", element: <AdminEmployeesPage /> },
          { path: "/admin/projects", element: <AdminProjectsPage /> },
        ],
      },
    ],
  },

  { path: "*", element: <Navigate to="/login" replace /> },
]);
