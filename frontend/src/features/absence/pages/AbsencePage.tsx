import TopBar from "../../../shared/components/TopBar.tsx";
import "../../../features/timesheets/styles/TimesheetPage.css";
import AbsenceForm from "../components/AbsenceForm.tsx";
import { useEffect, useState, useCallback } from "react";
import { saveAbsences, saveAbsencesFromPayload } from "../api/absenceApi.ts";
import type { Project } from "../../projects/types/projects.ts";
import { fetchTimeEntries } from "../../timesheets/api/timesheetsApi.ts";
import { useTimesheetWeek } from "../../timesheets/hooks/useTimesheetWeek.ts";

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
  const [workItemId, setWorkItemId] = useState<number | null>(null);
  const [hasTimeEntries, setHasTimeEntries] = useState(false);
  const { weekStart } = useTimesheetWeek();

  const handleProjectChange = useCallback((id: number) => {
    setProjectId(id);
    setWorkItemId(null);
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
    const userId = Number(localStorage.getItem("userId") ?? "1");
    if (absencePayload) return;
    async function loadSavedEntries() {
      try {
        const entries = await fetchTimeEntries(userId, weekStart);

        if (entries.length === 0) {
          setHasTimeEntries(false);
          setProjectId(null);
          setWorkItemId(null);
          return;
        }

        setHasTimeEntries(true);

        const projectMap = new Map<number, Project>();
        const workItemMap = new Map<number, { id: number; title: string }>();

        for (const entry of entries) {
          const project = entry.workItem.project;
          const workItem = entry.workItem;
          projectMap.set(project.id, project);
          workItemMap.set(workItem.id, {
            id: workItem.id,
            title: workItem.title,
          });
        }

        const loadedProject = Array.from(projectMap.values());
        const loadedWorkItems = Array.from(workItemMap.values());

        setProjects(Array.from(projectMap.values()));
        setWorkItems(Array.from(workItemMap.values()));

        if (loadedProject.length === 1) {
          setProjectId(loadedWorkItems[0].id);
        }

        if (loadedWorkItems.length === 1) {
          setWorkItemId(loadedWorkItems[0].id);
        }
      } catch (error) {
        console.error("Kunne ikke hente timeføringer:", error);
      }
    }
    loadSavedEntries();
  }, [weekStart, absencePayload]);

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

    if (!isRangeBased && !hasTimeEntries) {
      alert("Du må registrere timer i timeplanen før du kan registrer fravær.");
      return;
    }

    if (!projectId) {
      alert("Velg et prosjekt først.");
      return;
    }
    if (!workItemId) {
      alert("Velg en arbeidsoppgave først.");
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

    try {
      await saveAbsences(
        userId,
        absenceType,
        description,
        projectId,
        workItemId,
        selectedStartDate,
        selectedEndDate,
        hours,
        isRangeBased,
      );
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

  return (
    <div className="page">
      <div className="timesheet-shell">
        <TopBar />
        <section className="timesheet-card">
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
            workItemId={workItemId}
            onHoursChange={handleHoursChange}
            onRangeChange={handleRangeChange}
            onTypeChange={(type) => setAbsenceType(type)}
            onDescriptionChange={(desc) => setDescription(desc)}
            onProjectChange={handleProjectChange}
            onWorkItemChange={(id) => setWorkItemId(id)}
            onSave={handleSave}
            lockedDays={absencePayload ? lockedDaysFromPayload : {}}
            hasAbsenceParams={!!absencePayload}
            hideProjectFields={!!absencePayload}
          />
        </section>
      </div>
    </div>
  );
}
