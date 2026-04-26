import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { exportAdminInvoiceBasisExcel } from "../api/adminApi";
import { useToasts } from "../../../shared/hooks/useToasts";
import "../../../shared/styles/AdminExportPage.css";

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMondayOfCurrentWeek() {
  const today = new Date();
  const day = today.getDay() || 7;

  const monday = new Date(today);
  monday.setDate(today.getDate() - day + 1);
  monday.setHours(0, 0, 0, 0);

  return formatLocalDate(monday);
}

function getIsoWeek(date: Date) {
  const temp = new Date(date.getTime());
  temp.setHours(0, 0, 0, 0);

  const day = temp.getDay() || 7;
  temp.setDate(temp.getDate() + 4 - day);

  const yearStart = new Date(temp.getFullYear(), 0, 1);
  const week = Math.ceil(
    ((temp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );

  return {
    year: temp.getFullYear(),
    week,
  };
}

function toWeekInputValue(weekStart: string) {
  const date = new Date(`${weekStart}T00:00:00`);
  const { year, week } = getIsoWeek(date);

  return `${year}-W${String(week).padStart(2, "0")}`;
}

function getMondayFromWeekValue(weekValue: string) {
  const [yearText, weekText] = weekValue.split("-W");
  const year = Number(yearText);
  const week = Number(weekText);

  const jan4 = new Date(year, 0, 4);
  const jan4Day = jan4.getDay() || 7;

  const monday = new Date(jan4);
  monday.setDate(jan4.getDate() - jan4Day + 1 + (week - 1) * 7);
  monday.setHours(0, 0, 0, 0);

  return formatLocalDate(monday);
}

function formatWeekLabel(weekStart: string) {
  const start = new Date(`${weekStart}T00:00:00`);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const { week } = getIsoWeek(start);

  return `Uke ${week} (${start.toLocaleDateString("nb-NO")} - ${end.toLocaleDateString("nb-NO")})`;
}

export default function AdminExportPage() {
  const navigate = useNavigate();
  const { showToast } = useToasts();

  const [weekStart, setWeekStart] = useState(getMondayOfCurrentWeek());
  const [loading, setLoading] = useState(false);

  async function handleExportInvoiceBasis() {
    try {
      setLoading(true);

      const blob = await exportAdminInvoiceBasisExcel(weekStart);

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
              type="week"
              value={toWeekInputValue(weekStart)}
              onChange={(e) =>
                setWeekStart(getMondayFromWeekValue(e.target.value))
              }
              className="admin-export-input"
            />

            <span className="admin-export-week-label">
              {formatWeekLabel(weekStart)}
            </span>

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
