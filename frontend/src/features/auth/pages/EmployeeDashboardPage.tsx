import { useNavigate } from "react-router-dom";
import { Clock3, CalendarX2, Settings, LogOut } from "lucide-react";
import TopBar from "../../../shared/components/TopBar";
import { logout, getAuthUser } from "../hooks/useAuth";
import "../../../shared/styles/EmployeeDashboardPage.css";

type DashboardCard = {
  title: string;
  description: string;
  path: string;
  icon: React.ElementType;
};

export default function EmployeeDashboardPage() {
  const navigate = useNavigate();
  const user = getAuthUser();

  const cards: DashboardCard[] = [
    {
      title: "Timeføring",
      description: "Før timer og se ukeoversikten din.",
      path: "/timesheet",
      icon: Clock3,
    },
    {
      title: "Fravær",
      description: "Registrer ferie, sykdom og annet fravær.",
      path: "/absence",
      icon: CalendarX2,
    },
    {
      title: "Innstillinger",
      description: "Se brukerinfo og tilpass kontoen din.",
      path: "/settings",
      icon: Settings,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="employee-dashboard-page">
      <div className="employee-dashboard-shell">
        <TopBar />

        <section className="employee-dashboard-card-wrap">
          <div className="employee-dashboard-header">
            <div>
              <p className="employee-dashboard-kicker">TIMEOPPFØLGING</p>
              <h1>Oversikt</h1>
              <p className="employee-dashboard-subtitle">
                Velg hva du vil jobbe med.
              </p>
            </div>

            <div className="employee-dashboard-user-actions">
              <span className="employee-dashboard-user-name">
                {user?.displayName || "Bruker"}
              </span>

              <button
                type="button"
                className="employee-dashboard-logout-button"
                onClick={handleLogout}
              >
                <LogOut size={18} />
                <span>Logg ut</span>
              </button>
            </div>
          </div>

          <div className="employee-dashboard-grid">
            {cards.map((card) => {
              const Icon = card.icon;

              return (
                <button
                  key={card.path}
                  type="button"
                  className="employee-dashboard-card"
                  onClick={() => navigate(card.path)}
                >
                  <div className="employee-dashboard-card-icon">
                    <Icon size={22} />
                  </div>

                  <div className="employee-dashboard-card-body">
                    <h2>{card.title}</h2>
                    <p>{card.description}</p>
                  </div>

                  <span className="employee-dashboard-card-link">Åpne</span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
