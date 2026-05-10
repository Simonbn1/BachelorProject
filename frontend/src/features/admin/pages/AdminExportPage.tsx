import { useState } from "react";
import { DatePicker } from "@mantine/dates";
import { useNavigate } from "react-router-dom";
import { exportAdminInvoiceBasisExcel } from "../api/adminApi";
import { useToasts } from "../../../shared/hooks/useToasts";
import "../../../shared/styles/admin.css";
import "../../../shared/styles/AdminExportPage.css";
import "../../../shared/styles/globals.css";

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

function getMondayFromDate(date: Date) {
  const day = date.getDay() || 7;
  const monday = new Date(date);

  monday.setDate(date.getDate() - day + 1);
  monday.setHours(0, 0, 0, 0);

  return monday;
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

function formatWeekLabel(weekStart: string) {
  const start = new Date(`${weekStart}T12:00:00`);
  const end = new Date(start);

  end.setDate(start.getDate() + 4);

  const { week } = getIsoWeek(start);

  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
  };

  return `Uke ${week} (${start.toLocaleDateString(
    "nb-NO",
    options,
  )} – ${end.toLocaleDateString("nb-NO", options)})`;
}

export default function AdminExportPage() {
  const navigate = useNavigate();
  const { showToast } = useToasts();

  const [weekStart, setWeekStart] = useState(getMondayOfCurrentWeek());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
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
    <div className="admin-page">
      <div className="admin-page-header">
        <div className="admin-page-header-content">
          <div className="admin-intro-header">
            <button
              type="button"
              className="page-back-button"
              onClick={() => navigate("/admin")}
            >
              ← Oversikt
            </button>
            <div className="admin-intro-text">
              <h1>Fakturagrunnlag</h1>
              <p className="admin-subtitle">
                Eksporter godkjente timer og fravær for valgt uke.
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="admin-export-card">
        <div className="admin-export-header">
          <h2>Eksport</h2>
          <p>Velg uke og hent ut fakturagrunnlag.</p>
        </div>

        <div className="admin-export-form">
          <div>
            <label>Uke</label>

            <button
              type="button"
              className="admin-week-picker-button"
              onClick={() => setIsCalendarOpen(true)}
            >
              {formatWeekLabel(weekStart)}
              <span>🗓</span>
            </button>
          </div>

          <button
            type="button"
            className="admin-secondary-button"
            onClick={handleExportInvoiceBasis}
            disabled={loading}
          >
            {loading ? "Eksporterer..." : "Eksporter fakturagrunnlag"}
          </button>
        </div>
      </section>

      {isCalendarOpen && (
        <div
          className="wireframe-modal"
          onClick={() => setIsCalendarOpen(false)}
        >
          <div
            className="modal-content modal-content--calendar"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-btn"
              type="button"
              onClick={() => setIsCalendarOpen(false)}
            >
              x
            </button>

            <h5 className="modal-week-title">{formatWeekLabel(weekStart)}</h5>

            <DatePicker
              value={weekStart}
              onChange={(value) => {
                if (!value) return;

                const selectedDate = new Date(`${value}T12:00:00`);
                const monday = getMondayFromDate(selectedDate);
                const mondayString = formatLocalDate(monday);

                setWeekStart(mondayString);
                setIsCalendarOpen(false);
              }}
              locale="nb"
              firstDayOfWeek={1}
            />
          </div>
        </div>
      )}
    </div>
  );
}
