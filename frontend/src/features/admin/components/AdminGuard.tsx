import { Navigate, Outlet } from "react-router-dom";
import { getAuthUser } from "../../auth/types/auth";

export default function AdminGuard() {
  const user = getAuthUser();

  if (!user || !user.roles.includes("ADMIN")) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
