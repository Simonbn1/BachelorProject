import "../styles/TopBar.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarOff, Clock, LogOut, Settings, X } from "lucide-react";
import { clearAuth, getAuthUser } from "../../features/auth/types/auth";

export default function TopBar() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const user = getAuthUser();
  const userName = user?.displayName || "User";
  const initial = userName.charAt(0).toUpperCase();

  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    clearAuth();
    closeMenu();
    navigate("/login", { replace: true });
  };

  const goTo = (path: string) => {
    closeMenu();
    navigate(path);
  };

  return (
    <>
      <nav className="topbar">
        <div className="topbar-left">
          <button
            className="menu-btn"
            type="button"
            aria-label={isMenuOpen ? "Lukk meny" : "Åpne meny"}
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            ☰
          </button>

          <div className="topbar-brand">accenture</div>
        </div>

        <div className="topbar-right">
          <div className="topbar-user-chip">
            <span className="topbar-user-name">{userName}</span>
            <span className="avatar">{initial}</span>
          </div>
        </div>
      </nav>

      {isMenuOpen && <div className="sidebar-overlay" onClick={closeMenu} />}

      <aside className={`sidebar ${isMenuOpen ? "sidebar--open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-title">Navigasjon</div>

          <button
            className="sidebar-close-btn"
            type="button"
            aria-label="Lukk meny"
            onClick={closeMenu}
          >
            <X size={18} />
          </button>
        </div>

        <ul className="sidebar-list">
          <li className="sidebar-item" onClick={() => goTo("/timesheet")}>
            <Clock size={18} />
            <span>Timeføring</span>
          </li>

          <li className="sidebar-item" onClick={() => goTo("/absence")}>
            <CalendarOff size={18} />
            <span>Fravær</span>
          </li>

          <li className="sidebar-item" onClick={() => goTo("/settings")}>
            <Settings size={18} />
            <span>Innstillinger</span>
          </li>

          <li
            className="sidebar-item sidebar-item--logout"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Logg ut</span>
          </li>
        </ul>
      </aside>
    </>
  );
}
