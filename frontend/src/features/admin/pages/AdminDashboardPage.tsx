import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  FileSpreadsheet,
  Users,
  FolderKanban,
} from "lucide-react";
import "../../../shared/styles/AdminDashboardPage.css";

type DashboardCard = {
  title: string;
  description: string;
  path: string;
  icon: React.ElementType;
};

export default function AdminDashboardPage() {
  const navigate = useNavigate();

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

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-header">
        <p className="admin-dashboard-kicker">TIMEOPPFØLGING</p>
        <h1>Oversikt</h1>
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
