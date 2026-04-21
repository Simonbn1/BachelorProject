import { useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "../../../shared/api/client";
import type { MyTimesheet } from "../types/timesheet";
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
  status: TimesheetStatus;
  managerComment?: string | null;
  rows: TimeEntryRow[];
  absences: AbsenceItem[];
  availableWorkItems: WorkItemOption[];
};

type Props = {
  opened: boolean;
  timesheet: MyTimesheet | null;
  onClose: () => void;
  onSaved?: () => void | Promise<void>;
  onResubmitted?: () => void | Promise<void>;
};

type ProjectApi = {
  id: number;
  name: string;
  customer?: string;
  workItems?: {
    id: number;
    title: string;
    externalId?: string;
  }[];
};

type TimeEntryApi = {
  id?: number;
  entryDate: string;
  hours: number;
  description?: string;
  workItemId?: number;
  workItem?: {
    id: number;
    title: string;
    project?: {
      id: number;
      name: string;
    };
  };
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
  const start = new Date(`${weekStart}T00:00:00`);
  const end = new Date(start);
  end.setDate(start.getDate() + 4);

  const formatter = new Intl.DateTimeFormat("nb-NO", {
    day: "numeric",
    month: "long",
  });

  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

function getWeekNumber(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);
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

function getDayKeyFromDate(entryDate: string): DayKey | null {
  const date = new Date(`${entryDate}T00:00:00`);
  const day = date.getDay();

  if (day === 1) return "monday";
  if (day === 2) return "tuesday";
  if (day === 3) return "wednesday";
  if (day === 4) return "thursday";
  if (day === 5) return "friday";

  return null;
}

function buildWorkItems(projects: ProjectApi[]): WorkItemOption[] {
  return projects.flatMap((project) =>
    (project.workItems ?? []).map((workItem) => ({
      id: workItem.id,
      title: workItem.title,
      projectName: project.name,
    })),
  );
}

function buildRowsFromEntries(
  entries: TimeEntryApi[],
  availableWorkItems: WorkItemOption[],
): TimeEntryRow[] {
  const rowsMap = new Map<number, TimeEntryRow>();

  for (const entry of entries) {
    const workItemId = entry.workItem?.id ?? entry.workItemId;

    if (!workItemId) {
      continue;
    }

    if (!rowsMap.has(workItemId)) {
      const fallback = availableWorkItems.find(
        (item) => item.id === workItemId,
      );

      rowsMap.set(workItemId, {
        workItemId,
        workItemTitle: entry.workItem?.title ?? fallback?.title ?? "",
        projectName:
          entry.workItem?.project?.name ?? fallback?.projectName ?? "",
        monday: 0,
        tuesday: 0,
        wednesday: 0,
        thursday: 0,
        friday: 0,
      });
    }

    const row = rowsMap.get(workItemId)!;
    const dayKey = getDayKeyFromDate(entry.entryDate);

    if (!dayKey) {
      continue;
    }

    row[dayKey] = entry.hours ?? 0;
  }

  return Array.from(rowsMap.values());
}

export default function TimesheetEditModal({
  opened,
  timesheet,
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
    if (!opened || !timesheet) return;

    let ignore = false;

    async function loadTimesheet() {
      try {
        setLoading(true);
        setError("");
        setDetail(null);
        setRows([]);
        setAbsences([]);

        if (!timesheet) return;

        const [entriesResponse, projectsResponse] = await Promise.all([
          api.get<TimeEntryApi[]>("/api/time-entries", {
            params: { weekStart: timesheet.weekStart },
          }),
          api.get<ProjectApi[]>("/api/projects"),
        ]);

        if (ignore) return;

        const availableWorkItems = buildWorkItems(projectsResponse.data ?? []);
        const mappedRows = buildRowsFromEntries(
          entriesResponse.data ?? [],
          availableWorkItems,
        );

        const safeRows = mappedRows.length > 0 ? mappedRows : [emptyRow()];

        setDetail({
          timesheetId: timesheet.timesheetId,
          weekStart: timesheet.weekStart,
          status: timesheet.status,
          managerComment: timesheet.managerComment ?? null,
          rows: safeRows,
          absences: [],
          availableWorkItems,
        });

        setRows(safeRows);
        setAbsences([]);
      } catch (err) {
        console.error(err);
        if (!ignore) {
          setError("Kunne ikke hente timeføring.");
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
  }, [opened, timesheet]);

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

  async function persistRows() {
    if (!timesheet) return;

    const uniqueWorkItemIds = Array.from(
      new Set(rows.map((row) => row.workItemId).filter(Boolean)),
    ) as number[];

    for (const workItemId of uniqueWorkItemIds) {
      await api.delete("/api/time-entries", {
        params: {
          workItemId,
          weekStart: timesheet.weekStart,
        },
      });
    }

    const start = new Date(`${timesheet.weekStart}T00:00:00`);

    for (const row of rows) {
      if (!row.workItemId) {
        continue;
      }

      const values = [
        { offset: 0, hours: row.monday },
        { offset: 1, hours: row.tuesday },
        { offset: 2, hours: row.wednesday },
        { offset: 3, hours: row.thursday },
        { offset: 4, hours: row.friday },
      ];

      for (const value of values) {
        if (!value.hours || value.hours <= 0) {
          continue;
        }

        const entryDate = new Date(start);
        entryDate.setDate(start.getDate() + value.offset);
        const entryDateStr = entryDate.toISOString().split("T")[0];

        await api.post("/api/time-entries", {
          weekStart: timesheet.weekStart,
          workItemId: row.workItemId,
          entryDate: entryDateStr,
          hours: value.hours,
        });
      }
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      setError("");

      await persistRows();
      await onSaved?.();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Kunne ikke lagre endringer.");
    } finally {
      setSaving(false);
    }
  }

  async function handleResubmit() {
    if (!timesheet) return;

    try {
      setSubmitting(true);
      setError("");

      await persistRows();

      await api.post("/api/timesheets/submit", {
        weekStart: timesheet.weekStart,
      });

      await onResubmitted?.();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Kunne ikke sende inn på nytt.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!opened) return null;

  const titleWeekStart = detail?.weekStart ?? timesheet?.weekStart;

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
              {titleWeekStart
                ? `Uke ${getWeekNumber(titleWeekStart)} • ${formatDateRange(titleWeekStart)}`
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

        {(detail || timesheet) && (
          <div className="timesheet-modal__meta">
            <span
              className={`timesheet-status timesheet-status--${(detail?.status ?? timesheet?.status ?? "NOT_SENT").toLowerCase()}`}
            >
              {formatStatus(
                (detail?.status ??
                  timesheet?.status ??
                  "NOT_SENT") as TimesheetStatus,
              )}
            </span>

            <span className="timesheet-total">
              Totalt: {totalHours.toFixed(1)} t
            </span>
          </div>
        )}

        {(detail?.managerComment ?? timesheet?.managerComment) && (
          <div className="timesheet-modal__comment">
            <div className="timesheet-modal__comment-label">
              Kommentar fra admin
            </div>
            <div className="timesheet-modal__comment-text">
              {detail?.managerComment ?? timesheet?.managerComment}
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

function FragmentRow({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
