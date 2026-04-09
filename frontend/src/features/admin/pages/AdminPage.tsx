import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminOverviewTable from "../components/AdminOverviewTable";
import { fetchAdminTimesheets } from "../api/adminApi";
import type { AdminTimesheetSummary } from "../types/admin";
import "../../../shared/styles/admin.css";

function getMondayOfCurrentWeek() {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split("T")[0];
}

export default function AdminPage() {
  const navigate = useNavigate();

  const [weekStart, setWeekStart] = useState(getMondayOfCurrentWeek());
  const [items, setItems] = useState<AdminTimesheetSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedTimesheetId, setSelectedTimesheetId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");
        const data = await fetchAdminTimesheets(weekStart);
        setItems(data);
      } catch (err) {
        console.error(err);
        setError("Kunne ikke hente oversikten.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [weekStart]);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div className="admin-page-header-content">
          <button
            type="button"
            className="page-back-button"
            onClick={() => navigate("/admin")}
          >
            ← Tilbake til oversikt
          </button>

          <p className="admin-eyebrow">TIMEOPPFØLGING</p>
          <h1>Godkjenn timer</h1>
          <p className="admin-subtitle">
            Se innsendinger per uke, åpne detaljer og godkjenn eller avvis.
          </p>
        </div>

        <div className="admin-filter-card">
          <label htmlFor="weekStart">Uke start</label>
          <input
            id="weekStart"
            type="date"
            value={weekStart}
            onChange={(e) => setWeekStart(e.target.value)}
          />
        </div>
      </div>

      {loading && <div className="admin-info-card">Laster oversikt...</div>}

      {!loading && error && <div className="admin-error-card">{error}</div>}

      {!loading && !error && items.length > 0 && (
        <AdminOverviewTable
          items={items}
          onOpenDetails={(timesheetId) => setSelectedTimesheetId(timesheetId)}
        />
      )}

      {!loading && !error && items.length === 0 && (
        <div className="admin-info-card">
          Ingen innsendinger funnet for valgt uke.
        </div>
      )}

      {selectedTimesheetId !== null && (
        <div className="admin-info-card">
          Valgt timesheet id: {selectedTimesheetId}. Neste steg er å koble på
          detaljvisning her.
        </div>
      )}
    </div>
  );
}
