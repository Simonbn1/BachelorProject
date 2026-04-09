import { useNavigate } from "react-router-dom";
import { ClipboardList, FileSpreadsheet, Users, FolderKanban } from "lucide-react";
import "../../../shared/styles/AdminDashboardPage.css";

type AdminCard = {
    title: string;
    description: string;
    icon: React.ElementType;
    path: string;
};

export default function AdminDashboardPage() {
    const navigate = useNavigate();

    const cards: AdminCard[] = [
        {
            title: "Behandle timesheets",
            description: "Se ukesinnsendinger, åpne detaljer og godkjenn eller avvis.",
            icon: ClipboardList,
            path: "/admin/timesheets",
        },
        {
            title: "Eksporter fakturagrunnlag",
            description: "Eksporter timer og fravær for videre fakturering og oppfølging.",
            icon: FileSpreadsheet,
            path: "/admin/export",
        },
        {
            title: "Ansatte",
            description: "Se brukere, roller og administrativ informasjon.",
            icon: Users,
            path: "/admin/employees",
        },
        {
            title: "Prosjekter",
            description: "Administrer prosjekter og work items.",
            icon: FolderKanban,
            path: "/admin/projects",
        },
    ];

    return (
        <div className="admin-dashboard-page">
            <div className="admin-dashboard-hero">
                <p className="admin-dashboard-kicker">ADMINPANEL</p>
                <h1>Oversikt og administrasjon</h1>
                <p className="admin-dashboard-subtitle">
                    Velg en funksjon for å administrere timesheets, eksport og data.
                </p>
            </div>

            <div className="admin-dashboard-grid">
                {cards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <button
                            key={card.path}
                            className="admin-dashboard-card"
                            onClick={() => navigate(card.path)}
                            type="button"
                        >
                            <div className="admin-dashboard-card-icon">
                                <Icon size={22} />
                            </div>

                            <div className="admin-dashboard-card-content">
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