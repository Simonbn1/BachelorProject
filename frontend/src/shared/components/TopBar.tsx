import "../styles/TopBar.css";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { clearAuth, getAuthUser } from "../../features/auth/types/auth";
import { useEffect, useState } from "react";

export default function TopBar() {
  const navigate = useNavigate();

  const [user, setUser] = useState(getAuthUser);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() =>
    localStorage.getItem("avatarUrl"),
  );

  const userName = user?.displayName || "User";
  const initial = userName.charAt(0).toUpperCase();

  useEffect(() => {
    function handleStorageChange() {
      setUser(getAuthUser());
      setAvatarUrl(localStorage.getItem("avatarUrl"));
    }
    window.addEventListener("storageChange", handleStorageChange);
    return () =>
      window.removeEventListener("storageChange", handleStorageChange);
  }, []);

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  return (
    <nav className="topbar">
      <div className="topbar-left">
        <div className="topbar-brand">
          accenture<span>&gt;</span>
        </div>
      </div>

      <div className="topbar-right">
        <div className="topbar-user-chip">
          <span className="topbar-user-name">{userName}</span>
          {avatarUrl ? (
            <img src={avatarUrl} alt={userName} className="avatar" />
          ) : (
            <span className="avatar">{initial}</span>
          )}
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
