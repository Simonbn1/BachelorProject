import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  FileSpreadsheet,
  Users,
  FolderKanban,
  LogOut,
} from "lucide-react";
import { clearAuth, getAuthUser } from "../../auth/types/auth";
import "../../../shared/styles/AdminDashboardPage.css";

type DashboardCard = {
  title: string;
  description: string;
  path: string;
  icon: React.ElementType;
};

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const user = getAuthUser();

  const cards: DashboardCard[] = [
    {
      title: "Godkjenn timer",
      description:
        "Se ukesinnsendinger, åpne detaljer og godkjenn eller avvis.",
      path: "/admin/timesheets",
      icon: ClipboardList,
    },
    {
      title: "Fakturagrunnlag",
      description:
        "Eksporter timer og fravær for videre fakturering og oppfølging.",
      path: "/admin/export",
      icon: FileSpreadsheet,
    },
    {
      title: "Ansatte",
      description: "Se brukere, roller og administrativ informasjon.",
      path: "/admin/employees",
      icon: Users,
    },
    {
      title: "Prosjekter",
      description: "Administrer prosjekter og work items.",
      path: "/admin/projects",
      icon: FolderKanban,
    },
  ];

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-topbar">
        <div className="admin-dashboard-topbar-spacer" />
        <div className="admin-dashboard-topbar-actions">
          <span className="admin-dashboard-user">
            {user?.displayName || "Admin"}
          </span>

          <button
            type="button"
            className="admin-dashboard-logout-button"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Logg ut</span>
          </button>
        </div>
      </div>

      <div className="admin-dashboard-header">
        <p className="admin-dashboard-kicker">TIMEOPPFØLGING</p>
        <h1 className="admin-dashboard-title">Oversikt</h1>
        <p className="admin-dashboard-subtitle">
          Velg en funksjon for å følge opp timer, fakturagrunnlag og ansatte.
        </p>
      </div>

      <div className="admin-dashboard-grid">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <button
              key={card.path}
              className="admin-dashboard-card"
              type="button"
              onClick={() => navigate(card.path)}
            >
              <div className="admin-dashboard-card-icon">
                <Icon size={22} />
              </div>

              <div className="admin-dashboard-card-body">
                <h2>{card.title}</h2>
                <p>{card.description}</p>
              </div>

              <span className="admin-dashboard-card-link">Åpne</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
