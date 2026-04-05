import TopBar from "../../../shared/components/TopBar.tsx";
import "../../../features/timesheets/styles/TimesheetPage.css";
import AbsenceForm from "../components/AbsenceForm.tsx";
import { useEffect, useState, useCallback } from "react";
import { saveAbsences, saveAbsencesFromPayload } from "../api/absenceApi.ts";
import type { Project } from "../../projects/types/projects.ts";
import {
  parseLocalDate,
  useTimesheetWeek,
} from "../../timesheets/hooks/useTimesheetWeek.ts";
import { fetchProjects } from "../../projects/api/projectsApi.ts";
import { fetchWorkItems } from "../../timesheets/api/timesheetsApi.ts";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DatePicker, type DatesRangeValue } from "@mantine/dates";

export type AbsencePayloadEntry = {
  projectId: number;
  workItemId: number;
  workItemTitle: string;
  projectName: string;
  missingHours: Record<string, number>;
};

export default function AbsencePage() {
  const [hours, setHours] = useState<Record<string, string>>({});
  const [absenceType, setAbsenceType] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [projectId, setProjectId] = useState<number | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [workItems, setWorkItems] = useState<{ id: number; title: string }[]>(
    [],
  );
  const [absencePayload, setAbsencePayload] = useState<
    AbsencePayloadEntry[] | null
  >(null);
  const [selectedWorkItemIds, setSelectedWorkItemIds] = useState<number[]>([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const { weekStart, weekLabel, weekNumber, goToPreviousWeek, goToNextWeek } =
    useTimesheetWeek();

  const handleProjectChange = useCallback((id: number) => {
    setProjectId(id);
  }, []);

  const handleRangeChange = useCallback((start: Date, end: Date) => {
    setSelectedStartDate(start);
    setSelectedEndDate(end);
  }, []);

  useEffect(() => {
    const raw = sessionStorage.getItem("absencePayload");
    if (raw) {
      const payload: AbsencePayloadEntry[] = JSON.parse(raw);
      sessionStorage.removeItem("absencePayload");

      const prefilled: Record<string, string> = {};
      for (const entry of payload) {
        for (const [day, missing] of Object.entries(entry.missingHours)) {
          const existing = parseFloat(prefilled[day] ?? "0");
          prefilled[day] = String(parseFloat((existing + missing).toFixed(1)));
        }
      }
      setAbsencePayload(payload);
      setAbsenceType("SICKNESS");
      setHours(prefilled);
    }
  }, []);

  useEffect(() => {
    if (absencePayload) return;
    async function loadProjects() {
      try {
        const data = await fetchProjects();
        setProjects(data);
      } catch (error) {
        console.error("Kunne ikke hente prosjekter:", error);
      }
    }
    loadProjects();
  }, [absencePayload]);

  const handleFillWeek = useCallback(() => {
    const days = ["mon", "tue", "wed", "thu", "fri"];
    const updated = { ...hours };

    const idsToFill =
      selectedWorkItemIds.length > 0 ? selectedWorkItemIds : [null];

    for (const wId of idsToFill) {
      for (const day of days) {
        const key = wId !== null ? `${wId}-${day}` : day;
        const val = parseFloat((updated[key] ?? "0").replace(",", ".")) || 0;
        if (val === 0) {
          updated[key] = "7.5";
        }
      }
    }
    setHours(updated);
  }, [hours, selectedWorkItemIds]);

  useEffect(() => {
    if (!projectId || absencePayload) return;
    async function loadWorkItems() {
      try {
        const items = await fetchWorkItems(projectId!);
        setWorkItems(items);
        setSelectedWorkItemIds([]);
      } catch (error) {
        console.error("Kunne ikke hente arbeidsoppgaver:", error);
      }
    }
    loadWorkItems();
  }, [projectId, absencePayload]);

  const handleHoursChange = useCallback((updated: Record<string, string>) => {
    setHours(updated);
  }, []);

  async function handleSave() {
    const userId = Number(localStorage.getItem("userId") ?? "1");
    const isRangeBased = absenceType === "VACATION" || absenceType === "LEAVE";

    if (!absenceType) {
      alert("Velg årsak til fravær først.");
      return;
    }

    if (absencePayload) {
      try {
        await saveAbsencesFromPayload(
          userId,
          absenceType,
          description,
          absencePayload,
        );
        alert("Fravær lagret");
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Noe gikk galt. Sjekk konsollen";
        alert(message);
      }
      return;
    }

    if (!projectId) {
      alert("Velg et prosjekt først.");
      return;
    }

    if (isRangeBased && (!selectedStartDate || !selectedEndDate)) {
      alert("Velg en periode først.");
      return;
    }

    if (!isRangeBased && Object.keys(hours).length === 0) {
      alert("Fyll inn timer for minst en dag.");
      return;
    }

    if (selectedWorkItemIds.length === 0) {
      alert("Velg en arbeidsoppgave først.");
      return;
    }

    try {
      for (const wId of selectedWorkItemIds) {
        const workItemHours: Record<string, string> = {};
        for (const day of days) {
          const val = hours[`${wId}-${day}`];
          if (val) workItemHours[day] = val;
        }
        await saveAbsences(
          userId,
          absenceType,
          description,
          projectId,
          wId,
          selectedStartDate,
          selectedEndDate,
          workItemHours,
          isRangeBased,
        );
      }
      alert("Fravær lagret!");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Noe gikk galt. Sjekk konsollen";
      alert(message);
    }
  }

  const lockedDaysFromPayload: Record<string, number> = {};
  if (absencePayload) {
    for (const entry of absencePayload) {
      for (const [day, missing] of Object.entries(entry.missingHours)) {
        lockedDaysFromPayload[day] = missing;
      }
    }
  }

  const days = ["mon", "tue", "wed", "thu", "fri"];
  const weekTotal = days.reduce((sum, day) => {
    if (selectedWorkItemIds.length > 0) {
      return (
        sum +
        selectedWorkItemIds.reduce((s, wId) => {
          return (
            s +
            (parseFloat((hours[`${wId}-${day}`] ?? "0").replace(",", ".")) || 0)
          );
        }, 0)
      );
    }
    return sum + (parseFloat((hours[day] ?? "0").replace(",", ".")) || 0);
  }, 0);
  const weeklyTarget = 37.5;
  const progressPercent = Math.min((weekTotal / weeklyTarget) * 100, 100);
  const startDate = parseLocalDate(weekStart);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 4);

  return (
    <div className="page">
      <div className="timesheet-shell">
        <TopBar />
        <section className="timesheet-card">
          <div className="timesheet-header">
            <div className="timesheet-header-left">
              <div className="week-nav-group">
                <button
                  className="week-icon"
                  type="button"
                  onClick={() => setIsCalendarOpen(true)}
                >
                  🗓
                </button>
                <div>
                  <div className="week-nav">
                    <button
                      className="add-project week-nav-btn"
                      type="button"
                      onClick={goToPreviousWeek}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <h5>Uke {weekNumber}</h5>
                    <button
                      className="add-project week-nav-btn"
                      type="button"
                      onClick={goToNextWeek}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="week-subtitle">{weekLabel}</div>
            </div>

            <div className="timesheet-progress-wrap">
              <div className="timesheet-progress">
                <div className="progress-text">
                  {weekTotal.toFixed(1).replace(".", ",")} /{""}
                  {weeklyTarget.toFixed(1).replace(".", ",")}
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          {absencePayload && (
            <div
              style={{
                marginBottom: "16px",
                padding: "12px 16px",
                background: "rgba(255,255,255, 0.05)",
                borderRadius: "8px",
              }}
            >
              <p
                style={{
                  margin: "0 0 8px",
                  fontSize: "0.85rem",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                Fravær registreres for:
              </p>
              {absencePayload.map((entry) => (
                <div
                  key={entry.workItemId}
                  style={{ fontSize: "0.9rem", marginBottom: "4px" }}
                >
                  <strong>{entry.projectName}</strong> - {entry.workItemTitle}
                  <span
                    style={{
                      marginLeft: "8px",
                      color: "rgba(255,255,255,0.4)",
                      fontSize: "0.8rem",
                    }}
                  >
                    (
                    {Object.entries(entry.missingHours)
                      .map(([day, h]) => `${day}: ${h}t`)
                      .join(", ")}
                    )
                  </span>
                </div>
              ))}
            </div>
          )}
          <AbsenceForm
            hours={hours}
            absenceType={absenceType}
            description={description}
            projectId={projectId}
            projects={projects}
            workItems={workItems}
            onHoursChange={handleHoursChange}
            onRangeChange={handleRangeChange}
            onTypeChange={(type) => setAbsenceType(type)}
            onDescriptionChange={(desc) => setDescription(desc)}
            onProjectChange={handleProjectChange}
            onSave={handleSave}
            lockedDays={absencePayload ? lockedDaysFromPayload : {}}
            hasAbsenceParams={!!absencePayload}
            hideProjectFields={!!absencePayload}
            selectedWorkItemIds={selectedWorkItemIds}
            onWorkItemIdsChange={setSelectedWorkItemIds}
            onFillWeek={handleFillWeek}
          />
        </section>
      </div>
      {isCalendarOpen && (
        <div
          className="wireframe-modal"
          onClick={() => setIsCalendarOpen(false)}
        >
          <div
            className="modal-content"
            style={{ width: "fit-content" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-btn"
              type="button"
              onClick={() => setIsCalendarOpen(false)}
            >
              x
            </button>
            <h5 style={{ margin: "0 0 16px" }}>Uke {weekNumber}</h5>
            <DatePicker
              type="range"
              value={[startDate, endDate] as DatesRangeValue}
              onChange={() => {}}
              locale="nb"
              firstDayOfWeek={1}
            />
          </div>
        </div>
      )}
    </div>
  );
}
