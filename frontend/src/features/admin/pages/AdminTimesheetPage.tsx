import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminOverviewTable from "../components/AdminOverviewTable";
import { fetchAdminTimesheets } from "../api/adminApi";
import type { AdminTimesheetSummary } from "../types/admin";
import "../../../shared/styles/admin.css";

function getCurrentWeekValue() {
  const today = new Date();
  const date = new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()),
  );
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);

  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
    ((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );

  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function weekValueToMonday(weekValue: string) {
  const [yearPart, weekPart] = weekValue.split("-W");
  const year = Number(yearPart);
  const week = Number(weekPart);

  const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
  const dayOfWeek = simple.getUTCDay() || 7;
  const monday = new Date(simple);

  if (dayOfWeek <= 4) {
    monday.setUTCDate(simple.getUTCDate() - dayOfWeek + 1);
  } else {
    monday.setUTCDate(simple.getUTCDate() + (8 - dayOfWeek));
  }

  return monday.toISOString().split("T")[0];
}

export default function AdminTimesheetPage() {
  const navigate = useNavigate();

  const initialWeek = getCurrentWeekValue();

  const [selectedWeek, setSelectedWeek] = useState(initialWeek);
  const [weekStart, setWeekStart] = useState(weekValueToMonday(initialWeek));
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
          <label htmlFor="weekStart">Uke</label>
          <input
            id="weekStart"
            type="week"
            value={selectedWeek}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedWeek(value);
              setWeekStart(weekValueToMonday(value));
            }}
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
        <div className="admin-empty-state">
          <div className="admin-empty-state-icon">📅</div>
          <div>
            <h2>Ingen innsendinger funnet</h2>
            <p>Det finnes ingen ukesinnsendinger for valgt uke enda.</p>
          </div>
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
