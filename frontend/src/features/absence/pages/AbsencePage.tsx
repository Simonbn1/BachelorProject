import TopBar from "../../../shared/components/TopBar.tsx";
import "../../../features/timesheets/styles/TimesheetPage.css";
import AbsenceForm from "../components/AbsenceForm.tsx";
import { useEffect, useState, useCallback } from "react";
import { saveAbsences } from "../api/absenceApi.ts";
import { api } from "../../../shared/api/client.ts";
import type { Project } from "../../projects/types/projects.ts";

export default function AbsencePage() {
  const [hours, setHours] = useState<Record<string, string>>({});
  const [absenceType, setAbsenceType] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [projectId, setProjectId] = useState<number | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);

  const handleRangeChange = useCallback((start: Date, end: Date) => {
    setSelectedStartDate(start);
    setSelectedEndDate(end);
  }, []);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await api.get("api/projects");
        setProjects(response.data);
      } catch (error) {
        console.error("Kunne ikke hente prosjekter:", error);
      }
    }
    fetchProjects();
  }, []);

  const handleHoursChange = useCallback((updated: Record<string, string>) => {
    setHours(updated);
  }, []);

  async function handleSave() {
    if (!projectId) {
      alert("Velg et prosjekt først.");
      return;
    }

    if (!absenceType) {
      alert("Velg årsak til fravær først.");
      return;
    }

    if (!selectedStartDate || !selectedEndDate) {
      alert("Velg en periode først.");
      return;
    }

    const userId = Number(localStorage.getItem("userId") ?? "1");

    try {
      await saveAbsences(
        userId,
        absenceType,
        description,
        projectId,
        selectedStartDate,
        selectedEndDate,
      );
      alert("Fravær lagret!");
    } catch (error) {
      console.error("Feil ved lagring av fravær:", error);
      alert("Noe gikk galt. Sjekk konsollen.");
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
            onHoursChange={handleHoursChange}
            onRangeChange={handleRangeChange}
            onTypeChange={(type) => setAbsenceType(type)}
            onDescriptionChange={(desc) => setDescription(desc)}
            onProjectChange={(id) => setProjectId(id)}
            onSave={handleSave}
          />
        </section>
      </div>
    </div>
  );
}
