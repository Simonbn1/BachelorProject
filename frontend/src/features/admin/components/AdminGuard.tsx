import { Navigate, Outlet } from "react-router-dom";
import { getAuthUser } from "../../auth/types/auth";

export default function AdminGuard() {
  const user = getAuthUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.roles.includes("ADMIN")) {
    return <Navigate to="/timesheet" replace />;
  }

  return <Outlet />;
}
