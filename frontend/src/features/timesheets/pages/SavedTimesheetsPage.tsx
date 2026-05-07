import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  deleteTimesheet,
  fetchMyTimesheets,
  submitTimesheet,
  withdrawTimesheet,
} from "../api/timesheetsApi";
import type { MyTimesheet } from "../types/timesheet";
import TimesheetEditModal from "../components/TimesheetEditModal";
import "../../../shared/styles/globals.css";
import "../styles/SavedTimesheetsPage.css";

function formatWeekRange(weekStart: string) {
  const start = new Date(`${weekStart}T00:00:00`);
  const end = new Date(start);
  end.setDate(start.getDate() + 4);

  const formatOptions: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
  };

  return `${start.toLocaleDateString("nb-NO", formatOptions)} - ${end.toLocaleDateString("nb-NO", formatOptions)}`;
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

function getStatusLabel(status: MyTimesheet["status"]) {
  switch (status) {
    case "NOT_SENT":
      return "Ikke sendt";
    case "SENT":
      return "Til behandling";
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

  const [items, setItems] = useState<MyTimesheet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const [selectedTimesheet, setSelectedTimesheet] =
    useState<MyTimesheet | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  async function loadTimesheets() {
    try {
      setLoading(true);
      setError("");

      const data = await fetchMyTimesheets();
      setItems(data);
    } catch (err) {
      console.error(err);
      setError("Kunne ikke hente dine timesheets.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTimesheets();
  }, []);

  async function handleSubmit(weekStart: string) {
    try {
      setError("");
      setActionMessage("");

      await submitTimesheet({ weekStart });
      setActionMessage("Timesheet sendt til godkjenning.");
      await loadTimesheets();
    } catch (err) {
      console.error(err);
      setError("Kunne ikke sende inn timesheet.");
    }
  }

  async function handleWithdraw(timesheetId: number) {
    const confirmed = window.confirm(
      "Vil du trekke tilbake denne innsendingen? Da kan du redigere eller slette den igjen.",
    );

    if (!confirmed) return;

    try {
      setError("");
      setActionMessage("");

      await withdrawTimesheet(timesheetId);
      setActionMessage("Timesheet ble trukket tilbake.");
      await loadTimesheets();
    } catch (err) {
      console.error(err);
      setError("Kunne ikke trekke tilbake timesheet.");
    }
  }

  async function handleDelete(timesheetId: number) {
    const confirmed = window.confirm(
      "Er du sikker på at du vil slette dette lagrede utkastet?",
    );

    if (!confirmed) return;

    try {
      setError("");
      setActionMessage("");

      await deleteTimesheet(timesheetId);
      setActionMessage("Timesheet ble slettet.");
      await loadTimesheets();
    } catch (err) {
      console.error(err);
      setError("Kunne ikke slette timesheet.");
    }
  }

  function handleOpen(timesheet: MyTimesheet) {
    setSelectedTimesheet(timesheet);
    setEditModalOpen(true);
  }

  function handleCloseModal() {
    setEditModalOpen(false);
    setSelectedTimesheet(null);
  }

  async function handleModalResubmitted() {
    setActionMessage("Timesheet ble sendt inn på nytt.");
    await loadTimesheets();
  }

  return (
    <div className="page">
      <div className="page-shell">
        <div className="page-intro">
          <div className="page-intro-header">
            <button
              type="button"
              className="page-back-button"
              onClick={() => navigate("/dashboard")}
            >
              ← Oversikt
            </button>
            <div className="page-intro-text">
              <h1 className="page-title">Mine timer</h1>
              <p className="page-subtitle">
                Se egne utkast og innsendinger, åpne dem igjen og følg statusen.
              </p>
            </div>
          </div>
        </div>

        {loading && (
          <div className="saved-timesheets-info">Laster dine timesheets...</div>
        )}

        {!loading && error && (
          <div className="saved-timesheets-error">{error}</div>
        )}

        {!loading && !error && actionMessage && (
          <div className="saved-timesheets-info">{actionMessage}</div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="saved-timesheets-empty">
            <div className="saved-timesheets-empty-icon">🕘</div>
            <div>
              <h2>Ingen timesheets funnet</h2>
              <p>Du har ingen registrerte timesheets enda.</p>
            </div>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="saved-timesheets-table-card">
            <table className="saved-timesheets-table">
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
                      <span
                        className={`saved-timesheets-status saved-timesheets-status--${item.status.toLowerCase()}`}
                      >
                        {getStatusLabel(item.status)}
                      </span>

                      {item.managerComment && (
                        <div className="saved-timesheets-comment">
                          Kommentar: {item.managerComment}
                        </div>
                      )}
                    </td>

                    <td>
                      <div className="saved-timesheets-actions">
                        <button
                          type="button"
                          className="saved-timesheets-action"
                          onClick={() => handleOpen(item)}
                        >
                          {item.status === "NOT_SENT" ||
                          item.status === "REJECTED"
                            ? "Åpne"
                            : "Vis"}
                        </button>

                        {item.status === "NOT_SENT" && (
                          <>
                            <button
                              type="button"
                              className="saved-timesheets-action saved-timesheets-action--primary"
                              onClick={() => handleSubmit(item.weekStart)}
                            >
                              Send inn
                            </button>

                            <button
                              type="button"
                              className="saved-timesheets-action saved-timesheets-action--danger"
                              onClick={() => handleDelete(item.timesheetId)}
                            >
                              Slett
                            </button>
                          </>
                        )}

                        {item.status === "SENT" && (
                          <button
                            type="button"
                            className="saved-timesheets-action saved-timesheets-action--secondary"
                            onClick={() => handleWithdraw(item.timesheetId)}
                          >
                            Trekk tilbake
                          </button>
                        )}

                        {item.status === "REJECTED" && (
                          <button
                            type="button"
                            className="saved-timesheets-action saved-timesheets-action--primary"
                            onClick={() => handleOpen(item)}
                          >
                            Rediger og send på nytt
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TimesheetEditModal
        opened={editModalOpen}
        timesheet={selectedTimesheet}
        onClose={handleCloseModal}
        onResubmitted={handleModalResubmitted}
      />
    </div>
  );
}
