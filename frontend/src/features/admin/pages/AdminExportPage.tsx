import TopBar from "../../../shared/components/TopBar";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { exportInvoiceBasisExcel } from "../../timesheets/api/timesheetsApi";
import { useToasts } from "../../../shared/hooks/useToasts";
import "../styles/AdminExportPage.css";

function getMondayOfCurrentWeek() {
    const today = new Date();
    const day = today.getDay();
    const diff = day === 0 ? -6 : 1 - day;

    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    monday.setHours(0, 0, 0, 0);

    return monday.toISOString().split("T")[0];
}

export default function AdminExportPage() {
    const navigate = useNavigate();
    const { showToast } = useToasts();

    const [weekStart, setWeekStart] = useState(getMondayOfCurrentWeek());
    const [loading, setLoading] = useState(false);

    async function handleExportInvoiceBasis() {
        try {
            setLoading(true);

            const blob = await exportInvoiceBasisExcel(weekStart);

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = `fakturagrunnlag-${weekStart}.xlsx`;

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);

            showToast(
                "success",
                "Eksport fullført",
                "Fakturagrunnlag ble eksportert.",
                true,
            );
        } catch (error) {
            console.error("Eksport av fakturagrunnlag feilet:", error);

            showToast(
                "error",
                "Eksport feilet",
                "Kunne ikke eksportere fakturagrunnlag.",
                true,
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="page">
            <div className="admin-export-shell">
                <TopBar />

                <div className="page-intro">
                    <button
                        type="button"
                        className="page-back-button"
                        onClick={() => navigate("/admin")}
                    >
                        ← Tilbake til oversikt
                    </button>

                    <p className="page-kicker">TIMEOPPFØLGING</p>
                    <h1 className="page-title">Fakturagrunnlag</h1>
                    <p className="page-subtitle">
                        Eksporter godkjente timer og fravær for valgt uke.
                    </p>
                </div>

                <section className="admin-export-card">
                    <div className="admin-export-header">
                        <div>
                            <h2>Eksport</h2>
                            <p>Velg uke og hent ut fakturagrunnlag.</p>
                        </div>
                    </div>

                    <div className="admin-export-form">
                        <label htmlFor="weekStart">Uke</label>

                        <input
                            id="weekStart"
                            type="date"
                            value={weekStart}
                            onChange={(e) => setWeekStart(e.target.value)}
                            className="admin-export-input"
                        />

                        <button
                            type="button"
                            className="save-btn"
                            onClick={handleExportInvoiceBasis}
                            disabled={loading}
                        >
                            {loading ? "Eksporterer..." : "Eksporter fakturagrunnlag"}
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}