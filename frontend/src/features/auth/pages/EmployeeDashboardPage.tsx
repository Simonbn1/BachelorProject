import { useNavigate } from "react-router-dom";
import { Clock3, CalendarX2, Settings } from "lucide-react";
import TopBar from "../../../shared/components/TopBar";
import { getAuthUser } from "../hooks/useAuth";
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
  const firstName = user?.displayName?.split(" ")[0] || "der";

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

  return (
    <div className="employee-dashboard-page">
      <div className="employee-dashboard-shell">
        <TopBar />

        <section className="employee-dashboard-card-wrap">
          <div className="employee-dashboard-header">
            <p className="employee-dashboard-kicker">TIMEOPPFØLGING</p>
            <h1>Hei, {firstName}</h1>
            <p className="employee-dashboard-subtitle">
              Her kan du føre timer, registrere fravær og administrere kontoen
              din.
            </p>
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
