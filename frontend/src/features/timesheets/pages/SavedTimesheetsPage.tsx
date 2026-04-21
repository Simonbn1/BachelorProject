import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  deleteTimesheet,
  fetchDraftTimesheets,
  submitTimesheet,
} from "../api/timesheetsApi";
import type { SavedTimesheet } from "../types/timesheet";

function formatWeekRange(weekStart: string) {
  const start = new Date(`${weekStart}T00:00:00`);
  const end = new Date(start);
  end.setDate(start.getDate() + 4);

  const formatOptions: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
  };

  const startText = start.toLocaleDateString("nb-NO", formatOptions);
  const endText = end.toLocaleDateString("nb-NO", formatOptions);

  return `${startText} - ${endText}`;
}

function getWeekLabel(weekStart: string) {
  const date = new Date(`${weekStart}T00:00:00`);
  const target = new Date(date.valueOf());

  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);

  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const firstThursdayDayNr = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstThursdayDayNr + 3);

  const weekNo =
    1 +
    Math.round(
      (target.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000),
    );

  return `Uke ${weekNo}`;
}

function getStatusLabel(status: SavedTimesheet["status"]) {
  switch (status) {
    case "NOT_SENT":
      return "Ikke sendt";
    case "SENT":
      return "Sendt";
    case "APPROVED":
      return "Godkjent";
    case "REJECTED":
      return "Avvist";
    default:
      return status;
  }
}

export default function SavedTimesheetsPage() {
  const navigate = useNavigate();

  const [items, setItems] = useState<SavedTimesheet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  async function loadDrafts() {
    try {
      setLoading(true);
      setError("");
      const data = await fetchDraftTimesheets();
      setItems(data);
    } catch (err) {
      console.error(err);
      setError("Kunne ikke hente lagrede timer.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDrafts();
  }, []);

  async function handleSubmit(weekStart: string) {
    try {
      setError("");
      setActionMessage("");
      await submitTimesheet({ weekStart });
      setActionMessage("Timesheet sendt til godkjenning.");
      await loadDrafts();
    } catch (err) {
      console.error(err);
      setError("Kunne ikke sende inn timesheet.");
    }
  }

  async function handleDelete(timesheetId: number) {
    const confirmed = window.confirm(
      "Er du sikker på at du vil slette dette lagrede utkastet?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setActionMessage("");
      await deleteTimesheet(timesheetId);
      setActionMessage("Lagret timesheet ble slettet.");
      await loadDrafts();
    } catch (err) {
      console.error(err);
      setError("Kunne ikke slette timesheet.");
    }
  }

  function handleOpen(weekStart: string) {
    navigate(`/timesheet?weekStart=${weekStart}`);
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div className="admin-page-header-content">
          <button
            type="button"
            className="page-back-button"
            onClick={() => navigate("/dashboard")}
          >
            ← Tilbake til oversikt
          </button>

          <p className="admin-eyebrow">TIMEOPPFØLGING</p>
          <h1>Lagrede timer</h1>
          <p className="admin-subtitle">
            Se lagrede utkast, åpne dem igjen, send inn eller slett.
          </p>
        </div>
      </div>

      {loading && (
        <div className="admin-info-card">Laster lagrede timer...</div>
      )}

      {!loading && error && <div className="admin-error-card">{error}</div>}

      {!loading && !error && actionMessage && (
        <div className="admin-info-card">{actionMessage}</div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="admin-empty-state">
          <div className="admin-empty-state-icon">🕘</div>
          <div>
            <h2>Ingen lagrede timer</h2>
            <p>Du har ingen lagrede timesheets som ikke er sendt inn enda.</p>
          </div>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="admin-table-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Uke</th>
                <th>Periode</th>
                <th>Timer</th>
                <th>Fravær</th>
                <th>Status</th>
                <th>Handling</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr key={item.timesheetId}>
                  <td>{getWeekLabel(item.weekStart)}</td>
                  <td>{formatWeekRange(item.weekStart)}</td>
                  <td>{item.totalHours.toFixed(1)}</td>
                  <td>{item.hasAbsence ? "Ja" : "Nei"}</td>
                  <td>
                    <span className="admin-status-pill">
                      {getStatusLabel(item.status)}
                    </span>
                  </td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        type="button"
                        className="admin-action-button"
                        onClick={() => handleOpen(item.weekStart)}
                      >
                        Åpne
                      </button>

                      <button
                        type="button"
                        className="admin-action-button"
                        onClick={() => handleSubmit(item.weekStart)}
                      >
                        Send inn
                      </button>

                      <button
                        type="button"
                        className="admin-action-button"
                        onClick={() => handleDelete(item.timesheetId)}
                      >
                        Slett
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
