import "../styles/TopBar.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarOff, Clock, Settings } from "lucide-react";

type TopBarProps = {
  userName: string;
};

export default function TopBar({ userName }: TopBarProps) {
  const initial = userName.charAt(0).toUpperCase();
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <nav className="topbar">
        <div className="topbar-brand-wrap">
          <button
            className="menu-btn"
            type="button"
            aria-label="Åpne meny"
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            ☰
          </button>

          <div className="topbar-brand">accenture</div>
        </div>

        <div className="topbar-user">
          <span>{userName}</span>
          <span className="avatar">{initial}</span>
        </div>
      </nav>
      <div className={`slide-menu ${isMenuOpen ? "slide-menu--open" : ""}`}>
        <ul className="slide-menu-list">
          <li className="slide-menu-item" onClick={() => navigate("/")}>
            <Clock size={18} /> Timeføring
          </li>
          <li className="slide-menu-item" onClick={() => navigate("/absence")}>
            <CalendarOff size={18} /> Fravær
          </li>
          <li className="slide-menu-item" onClick={() => navigate("/settings")}>
            <Settings size={18} /> Instillinger
          </li>
        </ul>
      </div>
    </>
  );
}
