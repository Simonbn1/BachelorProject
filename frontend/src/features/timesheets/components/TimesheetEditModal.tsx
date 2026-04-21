import { useEffect, useMemo, useState } from "react";
import "../styles/TimesheetEditModal.css";

type TimesheetStatus = "NOT_SENT" | "SENT" | "APPROVED" | "REJECTED";

type WorkItemOption = {
  id: number;
  title: string;
  projectName?: string;
};

type TimeEntryRow = {
  workItemId: number | null;
  workItemTitle: string;
  projectName?: string;
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
};

type AbsenceItem = {
  id?: number;
  date: string;
  type: "VACATION" | "SICKNESS" | "LEAVE" | "OTHER";
  hours: number;
  description?: string;
};

type TimesheetDetail = {
  timesheetId: number;
  weekStart: string;
  weekEnd?: string;
  status: TimesheetStatus;
  managerComment?: string | null;
  rows: TimeEntryRow[];
  absences: AbsenceItem[];
  availableWorkItems: WorkItemOption[];
};

type Props = {
  opened: boolean;
  timesheetId: number | null;
  onClose: () => void;
  onSaved?: () => void;
  onResubmitted?: () => void;
};

const dayKeys = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
] as const;
type DayKey = (typeof dayKeys)[number];

const dayLabels: Record<DayKey, string> = {
  monday: "Man",
  tuesday: "Tir",
  wednesday: "Ons",
  thursday: "Tor",
  friday: "Fre",
};

function formatStatus(status: TimesheetStatus) {
  switch (status) {
    case "NOT_SENT":
      return "Utkast";
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

function formatDateRange(weekStart: string) {
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(start.getDate() + 4);

  const formatter = new Intl.DateTimeFormat("nb-NO", {
    day: "numeric",
    month: "long",
  });

  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

function getWeekNumber(dateString: string) {
  const date = new Date(dateString);
  const target = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  return Math.ceil(
    ((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
}

function emptyRow(): TimeEntryRow {
  return {
    workItemId: null,
    workItemTitle: "",
    projectName: "",
    monday: 0,
    tuesday: 0,
    wednesday: 0,
    thursday: 0,
    friday: 0,
  };
}

export default function TimesheetEditModal({
  opened,
  timesheetId,
  onClose,
  onSaved,
  onResubmitted,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState<TimesheetDetail | null>(null);
  const [rows, setRows] = useState<TimeEntryRow[]>([]);
  const [absences, setAbsences] = useState<AbsenceItem[]>([]);

  useEffect(() => {
    if (!opened || !timesheetId) return;

    let ignore = false;

    async function loadTimesheet() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/timesheets/${timesheetId}`, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Kunne ikke hente timeføring.");
        }

        const data: TimesheetDetail = await response.json();

        if (ignore) return;

        setDetail(data);
        setRows(data.rows?.length ? data.rows : [emptyRow()]);
        setAbsences(data.absences ?? []);
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Noe gikk galt.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadTimesheet();

    return () => {
      ignore = true;
    };
  }, [opened, timesheetId]);

  const totalHours = useMemo(() => {
    return rows.reduce((sum, row) => {
      return (
        sum +
        row.monday +
        row.tuesday +
        row.wednesday +
        row.thursday +
        row.friday
      );
    }, 0);
  }, [rows]);

  function updateRowValue(index: number, key: DayKey, value: string) {
    const parsed = value === "" ? 0 : Number(value);

    setRows((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
              ...row,
              [key]: Number.isNaN(parsed) ? 0 : parsed,
            }
          : row,
      ),
    );
  }

  function updateRowWorkItem(index: number, workItemIdValue: string) {
    const workItemId = workItemIdValue ? Number(workItemIdValue) : null;
    const selected = detail?.availableWorkItems.find(
      (item) => item.id === workItemId,
    );

    setRows((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
              ...row,
              workItemId,
              workItemTitle: selected?.title ?? "",
              projectName: selected?.projectName ?? "",
            }
          : row,
      ),
    );
  }

  function addRow() {
    setRows((prev) => [...prev, emptyRow()]);
  }

  function removeRow(index: number) {
    setRows((prev) =>
      prev.length === 1 ? prev : prev.filter((_, i) => i !== index),
    );
  }

  async function handleSave() {
    if (!detail) return;

    try {
      setSaving(true);
      setError("");

      const response = await fetch(`/api/timesheets/${detail.timesheetId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rows,
          absences,
        }),
      });

      if (!response.ok) {
        throw new Error("Kunne ikke lagre endringer.");
      }

      onSaved?.();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Noe gikk galt ved lagring.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleResubmit() {
    if (!detail) return;

    try {
      setSubmitting(true);
      setError("");

      const saveResponse = await fetch(
        `/api/timesheets/${detail.timesheetId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rows,
            absences,
          }),
        },
      );

      if (!saveResponse.ok) {
        throw new Error("Kunne ikke lagre før innsending.");
      }

      const submitResponse = await fetch(
        `/api/timesheets/${detail.timesheetId}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!submitResponse.ok) {
        throw new Error("Kunne ikke sende inn på nytt.");
      }

      onResubmitted?.();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Noe gikk galt ved ny innsending.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!opened) return null;

  return (
    <div className="timesheet-modal-overlay" onClick={onClose}>
      <div
        className="timesheet-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="timesheet-modal-title"
      >
        <div className="timesheet-modal__header">
          <div>
            <div className="timesheet-modal__eyebrow">TIMEOPPFØLGING</div>
            <h2 id="timesheet-modal-title" className="timesheet-modal__title">
              {detail
                ? `Uke ${getWeekNumber(detail.weekStart)} • ${formatDateRange(detail.weekStart)}`
                : "Laster timeføring..."}
            </h2>
          </div>

          <button
            className="timesheet-modal__close"
            onClick={onClose}
            type="button"
          >
            ✕
          </button>
        </div>

        {detail && (
          <div className="timesheet-modal__meta">
            <span
              className={`timesheet-status timesheet-status--${detail.status.toLowerCase()}`}
            >
              {formatStatus(detail.status)}
            </span>

            <span className="timesheet-total">
              Totalt: {totalHours.toFixed(1)} t
            </span>
          </div>
        )}

        {detail?.managerComment && (
          <div className="timesheet-modal__comment">
            <div className="timesheet-modal__comment-label">
              Kommentar fra admin
            </div>
            <div className="timesheet-modal__comment-text">
              {detail.managerComment}
            </div>
          </div>
        )}

        <div className="timesheet-modal__body">
          {loading && <div className="timesheet-modal__state">Laster...</div>}

          {error && <div className="timesheet-modal__error">{error}</div>}

          {!loading && detail && (
            <>
              <div className="timesheet-grid">
                <div className="timesheet-grid__header timesheet-grid__project">
                  Prosjekt
                </div>
                <div className="timesheet-grid__header">Man</div>
                <div className="timesheet-grid__header">Tir</div>
                <div className="timesheet-grid__header">Ons</div>
                <div className="timesheet-grid__header">Tor</div>
                <div className="timesheet-grid__header">Fre</div>
                <div className="timesheet-grid__header">Totalt</div>
                <div className="timesheet-grid__header">Handling</div>

                {rows.map((row, index) => {
                  const rowTotal =
                    row.monday +
                    row.tuesday +
                    row.wednesday +
                    row.thursday +
                    row.friday;

                  return (
                    <FragmentRow key={`${index}-${row.workItemId ?? "new"}`}>
                      <div className="timesheet-grid__cell timesheet-grid__project">
                        <select
                          className="timesheet-input"
                          value={row.workItemId ?? ""}
                          onChange={(e) =>
                            updateRowWorkItem(index, e.target.value)
                          }
                        >
                          <option value="">Velg prosjekt / work item</option>
                          {detail.availableWorkItems.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.projectName
                                ? `${item.projectName} - ${item.title}`
                                : item.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      {dayKeys.map((day) => (
                        <div className="timesheet-grid__cell" key={day}>
                          <input
                            className="timesheet-input"
                            type="number"
                            min="0"
                            step="0.5"
                            value={row[day]}
                            onChange={(e) =>
                              updateRowValue(index, day, e.target.value)
                            }
                            aria-label={`${dayLabels[day]} timer`}
                          />
                        </div>
                      ))}

                      <div className="timesheet-grid__cell timesheet-grid__total">
                        {rowTotal.toFixed(1)}
                      </div>

                      <div className="timesheet-grid__cell timesheet-grid__actions">
                        <button
                          type="button"
                          className="timesheet-row-button timesheet-row-button--ghost"
                          onClick={() => removeRow(index)}
                          disabled={rows.length === 1}
                        >
                          Fjern
                        </button>
                      </div>
                    </FragmentRow>
                  );
                })}
              </div>

              <div className="timesheet-modal__section-actions">
                <button
                  type="button"
                  className="timesheet-row-button"
                  onClick={addRow}
                >
                  + Legg til ny rad
                </button>
              </div>

              {absences.length > 0 && (
                <div className="timesheet-absence">
                  <h3 className="timesheet-absence__title">Fravær</h3>

                  <div className="timesheet-absence__list">
                    {absences.map((absence, index) => (
                      <div
                        key={`${absence.date}-${index}`}
                        className="timesheet-absence__item"
                      >
                        <div>{absence.date}</div>
                        <div>{absence.type}</div>
                        <div>{absence.hours.toFixed(1)} t</div>
                        <div>{absence.description || "—"}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="timesheet-modal__footer">
          <button
            type="button"
            className="timesheet-footer-button timesheet-footer-button--ghost"
            onClick={onClose}
          >
            Lukk
          </button>

          <button
            type="button"
            className="timesheet-footer-button"
            onClick={handleSave}
            disabled={saving || submitting || loading}
          >
            {saving ? "Lagrer..." : "Lagre"}
          </button>

          <button
            type="button"
            className="timesheet-footer-button timesheet-footer-button--primary"
            onClick={handleResubmit}
            disabled={saving || submitting || loading}
          >
            {submitting ? "Sender..." : "Send på nytt"}
          </button>
        </div>
      </div>
    </div>
  );
}

function FragmentRow({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
