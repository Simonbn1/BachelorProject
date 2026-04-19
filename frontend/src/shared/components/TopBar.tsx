import "../styles/TopBar.css";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { clearAuth, getAuthUser } from "../../features/auth/types/auth";

export default function TopBar() {
  const navigate = useNavigate();

  const user = getAuthUser();
  const userName = user?.displayName || "User";
  const initial = userName.charAt(0).toUpperCase();

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  return (
    <nav className="topbar">
      <div className="topbar-left">
        <div className="topbar-brand">accenture</div>
      </div>

      <div className="topbar-right">
        <div className="topbar-user-chip">
          <span className="topbar-user-name">{userName}</span>
          <span className="avatar">{initial}</span>
        </div>

        <button
          className="topbar-logout-btn"
          type="button"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          <span>Logg ut</span>
        </button>
      </div>
    </nav>
  );
}
