import TopBar from "../../../shared/components/TopBar.tsx";
import "../../../features/timesheets/styles/TimesheetPage.css";
import AbsenceForm from "../components/AbsenceForm.tsx";
import { useEffect, useState, useCallback } from "react";
import { saveAbsences } from "../api/absenceApi.ts";
import type { Project } from "../../projects/types/projects.ts";
import { fetchTimeEntries } from "../../timesheets/api/timesheetsApi.ts";
import { useTimesheetWeek } from "../../timesheets/hooks/useTimesheetWeek.ts";
import { useSearchParams } from "react-router-dom";

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
  const [searchParams] = useSearchParams();
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

  const missingHoursFromParams: Record<string, number> = {};
  const days = ["mon", "tue", "wed", "thu", "fri"];
  for (const day of days) {
    const val = searchParams.get(day);
    if (val) missingHoursFromParams[day] = parseFloat(val);
  }
  const hasAbsenceParams = Object.keys(missingHoursFromParams).length > 0;

  useEffect(() => {
    if (hasAbsenceParams) {
      const prefilled: Record<string, string> = {};
      for (const [day, missing] of Object.entries(missingHoursFromParams)) {
        prefilled[day] = String(missing).replace(",", ".");
      }
      setHours(prefilled);
      setAbsenceType("SICKNESS");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    async function loadSavedEntries() {
      try {
        const userId = Number(localStorage.getItem("userId") ?? "1");
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
  }, [weekStart]);

  const handleHoursChange = useCallback((updated: Record<string, string>) => {
    setHours(updated);
  }, []);

  async function handleSave() {
    const isRangeBased = absenceType === "VACATION" || absenceType === "LEAVE";

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

    if (!absenceType) {
      alert("Velg årsak til fravær først.");
      return;
    }

    const userId = Number(localStorage.getItem("userId") ?? "1");

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

  return (
    <div className="page">
      <div className="timesheet-shell">
        <TopBar />
        <section className="timesheet-card">
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
            lockedDays={missingHoursFromParams}
            hasAbsenceParams={hasAbsenceParams}
          />
        </section>
      </div>
    </div>
  );
}
