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
      await approveTimesheet({
        userId: detail.userId,
        weekStart: detail.weekStart,
      });
      await loadOverview();
      const updated = await fetchAdminTimesheetDetail(detail.timesheetId);
      setDetail(updated);
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
      await rejectTimesheet({
        userId: detail.userId,
        weekStart: detail.weekStart,
        comment: rejectComment,
      });
      await loadOverview();
      const updated = await fetchAdminTimesheetDetail(detail.timesheetId);
      setDetail(updated);
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

      {detailLoading && (
        <div className="admin-info-card">Laster detaljvisning...</div>
      )}

      {detail && !detailLoading && (
        <div className="admin-info-card">
          <h2 style={{ marginTop: 0 }}>{detail.userName}</h2>
          <p>Status: {detail.status}</p>
          <p>Uke: {detail.weekStart}</p>
          <p>Totalt: {detail.totalHours.toFixed(1)} timer</p>

          <h3>Timer</h3>
          {detail.entries.length === 0 ? (
            <p>Ingen førte timer.</p>
          ) : (
            <div>
              {detail.entries.map((entry) => (
                <div key={entry.id} style={{ marginBottom: "10px" }}>
                  <strong>{entry.projectName}</strong> – {entry.workItemTitle} –{" "}
                  {entry.entryDate} – {entry.hours}t
                  {entry.description && <div>{entry.description}</div>}
                </div>
              ))}
            </div>
          )}

          <h3>Fravær</h3>
          {detail.absences.length === 0 ? (
            <p>Ingen registrert fravær.</p>
          ) : (
            <div>
              {detail.absences.map((absence) => (
                <div key={absence.id} style={{ marginBottom: "10px" }}>
                  <strong>{absence.type}</strong> – {absence.absenceDate} –{" "}
                  {absence.hours}t
                  {absence.description && <div>{absence.description}</div>}
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: "20px" }}>
            <label htmlFor="rejectComment">Kommentar ved avslag</label>
            <textarea
              id="rejectComment"
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              rows={4}
              style={{
                width: "100%",
                marginTop: "8px",
                borderRadius: "12px",
                padding: "12px",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "20px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              className="admin-action-button"
              onClick={handleApprove}
              disabled={decisionLoading}
            >
              Godkjenn
            </button>

            <button
              type="button"
              className="admin-action-button"
              onClick={handleReject}
              disabled={decisionLoading}
            >
              Avslå
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
