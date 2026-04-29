import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminOverviewTable from "../components/AdminOverviewTable";
import {
  approveTimesheet,
  fetchAdminTimesheetDetail,
  fetchAdminTimesheets,
  rejectTimesheet,
} from "../api/adminApi";
import type {
  AdminTimesheetDetail,
  AdminTimesheetSummary,
} from "../types/admin";
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

function getWeekNumberFromDate(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);
  const temp = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = temp.getUTCDay() || 7;

  temp.setUTCDate(temp.getUTCDate() + 4 - dayNum);

  const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
  return Math.ceil(((temp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function formatWeekRange(weekStart: string) {
  const start = new Date(`${weekStart}T00:00:00`);
  const end = new Date(start);
  end.setDate(start.getDate() + 4);

  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
  };

  const startText = start.toLocaleDateString("nb-NO", options);
  const endText = end.toLocaleDateString("nb-NO", options);

  return `Uke ${getWeekNumberFromDate(weekStart)} (${startText} – ${endText})`;
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
  const [detail, setDetail] = useState<AdminTimesheetDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [decisionLoading, setDecisionLoading] = useState(false);
  const [rejectComment, setRejectComment] = useState("");

  async function loadOverview() {
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

  useEffect(() => {
    loadOverview();
  }, [weekStart]);

  useEffect(() => {
    async function loadDetail() {
      if (selectedTimesheetId === null) {
        setDetail(null);
        setRejectComment("");
        return;
      }

      try {
        setDetailLoading(true);
        setError("");
        const data = await fetchAdminTimesheetDetail(selectedTimesheetId);
        setDetail(data);
        setRejectComment(data.managerComment ?? "");
      } catch (err) {
        console.error(err);
        setError("Kunne ikke hente timesheet-detaljer.");
      } finally {
        setDetailLoading(false);
      }
    }

    loadDetail();
  }, [selectedTimesheetId]);

  async function handleApprove() {
    if (!detail) return;

    try {
      setDecisionLoading(true);
      setError("");

      await approveTimesheet({
        userId: detail.userId,
        weekStart: detail.weekStart,
      });

      await loadOverview();

      const updated = await fetchAdminTimesheetDetail(detail.timesheetId);
      setDetail(updated);
      setRejectComment(updated.managerComment ?? "");
    } catch (err) {
      console.error(err);
      setError("Kunne ikke godkjenne timesheet.");
    } finally {
      setDecisionLoading(false);
    }
  }

  async function handleReject() {
    if (!detail) return;

    try {
      setDecisionLoading(true);
      setError("");

      await rejectTimesheet({
        userId: detail.userId,
        weekStart: detail.weekStart,
        comment: rejectComment,
      });

      await loadOverview();

      const updated = await fetchAdminTimesheetDetail(detail.timesheetId);
      setDetail(updated);
      setRejectComment(updated.managerComment ?? "");
    } catch (err) {
      console.error(err);
      setError("Kunne ikke avslå timesheet.");
    } finally {
      setDecisionLoading(false);
    }
  }

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
              setSelectedTimesheetId(null);
            }}
          />
        </div>
      </div>

      {loading && <div className="admin-info-card">Laster oversikt...</div>}

      {!loading && error && <div className="admin-error-card">{error}</div>}

      {!loading && !error && items.length > 0 && (
        <AdminOverviewTable
          items={items}
          onOpenDetails={(id) => setSelectedTimesheetId(id)}
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

      {detailLoading && (
        <div className="admin-info-card">Laster detaljvisning...</div>
      )}

      {detail && !detailLoading && (
        <section className="admin-detail-panel">
          <div className="admin-detail-header">
            <div>
              <p className="admin-eyebrow">DETALJER</p>
              <h2>{detail.userName}</h2>
              {detail.userEmail && <p>{detail.userEmail}</p>}
            </div>

            <span
              className={`admin-status-pill status-${String(
                detail.status,
              ).toLowerCase()}`}
            >
              {detail.status}
            </span>
          </div>

          <div className="admin-detail-stats">
            <div>
              <span>Uke</span>
              <strong>{formatWeekRange(detail.weekStart)}</strong>
            </div>
            <div>
              <span>Totalt</span>
              <strong>{detail.totalHours.toFixed(1)} timer</strong>
            </div>
            <div>
              <span>Fravær</span>
              <strong>{detail.absences.length > 0 ? "Ja" : "Nei"}</strong>
            </div>
          </div>

          <div className="admin-detail-section">
            <h3>Timer</h3>

            {detail.timeEntries.length === 0 ? (
              <p className="admin-muted">Ingen førte timer.</p>
            ) : (
              <div className="admin-detail-table">
                <div className="admin-detail-table-head">
                  <span>Dato</span>
                  <span>Prosjekt / oppgave</span>
                  <span>Timer</span>
                  <span>Beskrivelse</span>
                </div>

                {detail.timeEntries.map((entry) => (
                  <div
                    className="admin-detail-table-row"
                    key={entry.timeEntryId}
                  >
                    <span>{entry.entryDate}</span>

                    <div>
                      <strong>{entry.projectName || "Ukjent prosjekt"}</strong>
                      <div className="admin-subtext">
                        {entry.workItemName || "Ingen oppgave valgt"}
                      </div>
                    </div>

                    <span>{entry.hours}t</span>
                    <span>{entry.description || "—"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="admin-detail-section">
            <h3>Fravær</h3>

            {detail.absences.length === 0 ? (
              <p className="admin-muted">Ingen registrert fravær.</p>
            ) : (
              <div className="admin-detail-table">
                <div className="admin-detail-table-head absence">
                  <span>Dato</span>
                  <span>Type</span>
                  <span>Timer</span>
                  <span>Beskrivelse</span>
                </div>

                {detail.absences.map((absence) => (
                  <div
                    className="admin-detail-table-row absence"
                    key={absence.id}
                  >
                    <span>{absence.absenceDate}</span>
                    <strong>{absence.type}</strong>
                    <span>{absence.hours}t</span>
                    <span>{absence.description || "—"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="admin-decision-box">
            <label htmlFor="rejectComment">Tilbakemelding ved avslag</label>
            <p>
              Skriv en kort forklaring dersom timelisten skal sendes tilbake.
            </p>

            <textarea
              id="rejectComment"
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              placeholder="F.eks. feil prosjekt, manglende timer eller behov for mer info..."
            />
          </div>

          <div className="admin-detail-actions">
            <button
              type="button"
              className="admin-approve-button"
              onClick={handleApprove}
              disabled={decisionLoading || detail.status === "APPROVED"}
            >
              Godkjenn
            </button>

            <button
              type="button"
              className="admin-reject-button"
              onClick={handleReject}
              disabled={decisionLoading}
            >
              Avslå og send tilbake
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
