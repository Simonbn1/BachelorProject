import { useEffect, useState } from "react";
import { fetchProjects } from "../../projects/api/projectsApi";
import type { Project } from "../../projects/types/projects";
import TopBar from "../../../shared/components/TopBar";
import {
  deleteTimeEntries,
  fetchTimeEntries,
  fetchWorkItems,
  saveTimeEntries,
  exportTimesheetExcel,
  exportInvoiceBasisExcel,
} from "../api/timesheetsApi.ts";
import { useTimesheetWeek, parseLocalDate } from "../hooks/useTimesheetWeek.ts";
import "../styles/TimesheetHeader.css";
import { DatePicker, type DatesRangeValue } from "@mantine/dates";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MultiSelectDropdown from "../components/MultiSelectDropdown.tsx";

type HoursState = Record<string, string>;
type ProjectWithWorkItem = Project & {
  workItemId: number;
  workItemTitle?: string;
};

export function TimesheetPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [visibleProjects, setVisibleProjects] = useState<ProjectWithWorkItem[]>(
    [],
  );
  const [hours, setHours] = useState<HoursState>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [showAbsencePrompt, setShowAbsencePrompt] = useState(false);
  const [workItems, setWorkItems] = useState<{ id: number; title: string }[]>(
    [],
  );
  const [selectedWorkItemId, setSelectedWorkItemId] = useState<number[]>([]);
  const [excludedFromAbsence, setExcludedFromAbsence] = useState<
    Record<string, boolean>
  >({});
  const [hoursError, setHoursError] = useState<string | null>(null);

  const { weekStart, weekLabel, weekNumber, goToPreviousWeek, goToNextWeek } =
    useTimesheetWeek();

  const navigate = useNavigate();
  const startDate = parseLocalDate(weekStart);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 4);

  useEffect(() => {
    setHours({});
    setVisibleProjects([]);
    setShowAbsencePrompt(false);

    async function loadEntries() {
      try {
        const userId = 1;
        const entries = await fetchTimeEntries(userId, weekStart);

        if (entries.length === 0) return;

        const loadedHours: HoursState = {};
        const loadedWorkItems = new Map<
          number,
          { projectId: number; title: string }
        >();

        for (const entry of entries) {
          const projectId = entry.workItem.project.id;
          const workItemId = entry.workItem.id;
          const workItemTitle = entry.workItem.title;
          const date = new Date(entry.entryDate);
          const dayIndex = date.getDay();
          const dayKeys: Record<number, string> = {
            1: "mon",
            2: "tue",
            3: "wed",
            4: "thu",
            5: "fri",
          };
          const day = dayKeys[dayIndex];
          if (day) {
            loadedHours[`${workItemId}-${day}`] = String(entry.hours).replace(
              ".",
              ",",
            );
          }
          loadedWorkItems.set(workItemId, { projectId, title: workItemTitle });
        }

        const loadedProjects: ProjectWithWorkItem[] = [];
        for (const [workItemId, { projectId, title }] of loadedWorkItems) {
          const project = projects.find((p) => p.id === projectId);
          if (project) {
            loadedProjects.push({
              ...project,
              workItemId,
              workItemTitle: title,
            });
          }
        }

        setVisibleProjects(loadedProjects);
        setHours(loadedHours);
      } catch (error) {
        console.error("Kunne ikke hente timeføringer:", error);
      }
    }
    loadEntries();
  }, [weekStart, projects]);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchProjects();
        setProjects(data);
      } catch (error) {
        console.error("Kunne ikke hente prosjekter:", error);
      }
    }
    load();
  }, []);

  function handleChange(workItemId: number, day: string, value: string) {
    const normalized = value.replace(",", ".");
    const key = `${workItemId}-${day}`;

    if (normalized === "" || /^(\d+)?([.]\d{0,1})?$/.test(normalized)) {
      const parsed = parseFloat(normalized);
      if (!isNaN(parsed) && parsed > 16) {
        setHoursError("Du kan ikke registrere mer enn 16 timer per dag.");
        return;
      }
      setHours((prev) => ({
        ...prev,
        [key]: value,
      }));
    }
  }

  function isOvertime(workItemId: number, day: string) {
    return getNumericValue(workItemId, day) > 7.5;
  }

  function getNumericValue(workItemId: number, day: string) {
    const raw = hours[`${workItemId}-${day}`] ?? "0";
    return Number.parseFloat(raw.replace(",", ".")) || 0;
  }

  function getRowTotal(workItemId: number) {
    const days = ["mon", "tue", "wed", "thu", "fri"];
    return days.reduce((sum, day) => sum + getNumericValue(workItemId, day), 0);
  }

  const weekTotal = visibleProjects.reduce(
    (sum, project) => sum + getRowTotal(project.workItemId),
    0,
  );

  const weeklyTarget = 37.5;
  const progressPercent = Math.min((weekTotal / weeklyTarget) * 100, 100);
  const overtimeTotal = Math.max(0, weekTotal - weeklyTarget);

  async function removeProject(workItemId: number) {
    const userId = 1;

    try {
      await deleteTimeEntries(userId, weekStart, workItemId);
    } catch (error) {
      console.debug("Kunne ikke hente prosjekter:", error);
    }

    setHours((prev) => {
      const updated = { ...prev };
      const days = ["mon", "tue", "wed", "thu", "fri"];
      for (const day of days) {
        delete updated[`${workItemId}-${day}`];
      }
      return updated;
    });
    setVisibleProjects((prev) =>
      prev.filter((project) => project.workItemId !== workItemId),
    );
  }

  function buildAbsencePayload() {
    const days = ["mon", "tue", "wed", "thu", "fri"];
    const today = new Date();
    const dayIndexMap: Record<string, number> = {
      mon: 0,
      tue: 1,
      wed: 2,
      thu: 3,
      fri: 4,
    };

    const result: {
      projectId: number;
      workItemId: number;
      workItemTitle: string;
      projectName: string;
      missingHours: Record<string, number>;
    }[] = [];

    for (const day of days) {
      const dayDate = new Date(startDate);
      dayDate.setDate(startDate.getDate() + dayIndexMap[day]);
      if (dayDate > today) continue;

      const totalWorked = visibleProjects.reduce(
        (sum, project) => sum + getNumericValue(project.workItemId, day),
        0,
      );

      if (totalWorked >= 7.5) continue;

      const missing = parseFloat((7.5 - totalWorked).toFixed(1));

      const responsibleProject = visibleProjects.find(
        (p) => !excludedFromAbsence[`${p.workItemId}-${day}`],
      );

      if (!responsibleProject) continue;

      const existing = result.find(
        (r) => r.workItemId === responsibleProject.workItemId,
      );

      if (existing) {
        existing.missingHours[day] = missing;
      } else {
        result.push({
          projectId: responsibleProject.id,
          workItemId: responsibleProject.workItemId,
          workItemTitle: responsibleProject.workItemTitle ?? "",
          projectName: responsibleProject.name,
          missingHours: { [day]: missing },
        });
      }
    }
    return result;
  }

  function toggleExcludedFromAbsence(workItemId: number, day: string) {
    const key = `${workItemId}-${day}`;
    setExcludedFromAbsence((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  function navigateToAbsence() {
    const days = ["mon", "tue", "wed", "thu", "fri"];
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const dayIndexMap: Record<string, number> = {
      mon: 0,
      tue: 1,
      wed: 2,
      thu: 3,
      fri: 4,
    };
    const dayLabels: Record<string, string> = {
      mon: "Mandag",
      tue: "Tirsdag",
      wed: "Onsdag",
      thu: "Torsdag",
      fri: "Fredag",
    };

    const conflictingDays: string[] = [];
    for (const day of days) {
      const dayDate = new Date(startDate);
      dayDate.setDate(startDate.getDate() + dayIndexMap[day]);
      if (dayDate > today) continue;

      const totalWorked = visibleProjects.reduce(
        (sum, project) => sum + getNumericValue(project.workItemId, day),
        0,
      );

      if (totalWorked >= 7.5) continue;

      const eligbleProjects = visibleProjects.filter(
        (p) => !excludedFromAbsence[`${p.workItemId}-${day}`],
      );
      if (eligbleProjects.length > 1) {
        conflictingDays.push(day);
      }
    }

    if (conflictingDays.length > 0) {
      const conflictNames = conflictingDays.map((d) => dayLabels[d]).join(", ");
      alert(
        `Flere prosjekter konkurrerer om fravær for: ${conflictNames}.\n\nHøyreklikk på dagen du ikke vil registrere fravær for å eksludere den.`,
      );
      setShowAbsencePrompt(true);
      return;
    }

    const payload = buildAbsencePayload();
    sessionStorage.setItem("absencePayload", JSON.stringify(payload));
    navigate("/absence");
  }

  function addSelectedProject() {
    const projectId = Number(selectedProjectId);
    const projectToAdd = projects.find((project) => project.id === projectId);

    if (!projectToAdd || selectedWorkItemId.length === 0) return;

    for (const workItemId of selectedWorkItemId) {
      const workItemToAdd = workItems.find((w) => w.id === workItemId);
      if (!workItemToAdd) continue;

      const alreadyExists = visibleProjects.some(
        (project) => project.workItemId === workItemId,
      );
      if (alreadyExists) continue;

      setVisibleProjects((prev) => [
        ...prev,
        { ...projectToAdd, workItemId, workItemTitle: workItemToAdd.title },
      ]);
    }

    setIsAddModalOpen(false);
    setSelectedProjectId("");
    setSelectedWorkItemId([]);
    setWorkItems([]);
  }

  // Save the project to the database
  async function handleSave() {
    const userId = 1;
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const dayIndexMap: Record<string, number> = {
      mon: 0,
      tue: 1,
      wed: 2,
      thu: 3,
      fri: 4,
    };

    try {
      for (const project of visibleProjects) {
        await saveTimeEntries(userId, weekStart, project.workItemId, hours);
      }
    } catch (error) {
      console.error("Feil ved lagring:", error);
      alert("Noe gikk galt ved lagring. Sjekk konsollen.");
      return;
    }

    const days = ["mon", "tue", "wed", "thu", "fri"];
    const passedDaysWithMissingHours = days.filter((day) => {
      const dayDate = new Date(startDate);
      dayDate.setDate(startDate.getDate() + dayIndexMap[day]);
      if (dayDate > today) return false;
      const totalWorked = visibleProjects.reduce(
        (sum, project) => sum + getNumericValue(project.workItemId, day),
        0,
      );
      return totalWorked < 7.5;
    });

    if (passedDaysWithMissingHours.length === 0) {
      alert("Timer lagret!");
      return;
    }

    const dayLabels: Record<string, string> = {
      mon: "Mandag",
      tue: "Tirsdag",
      wed: "Onsdag",
      thu: "Torsdag",
      fri: "Fredag",
    };
    const dayNames = passedDaysWithMissingHours
      .map((d) => dayLabels[d])
      .join(", ");
    const confirm = window.confirm(
      `Timer lagret! Du har ikke registrert 7,5 timer for: ${dayNames}.\n\nØnsker du å registrere fravær for disse dagene?`,
    );

    if (!confirm) {
      setShowAbsencePrompt(true);
      return;
    }

    const conflictingDays: string[] = [];
    for (const day of passedDaysWithMissingHours) {
      const eligbleProjects = visibleProjects.filter(
        (p) => !excludedFromAbsence[`${p.workItemId}-${day}`],
      );
      if (eligbleProjects.length > 1) {
        conflictingDays.push(day);
      }
    }

    if (conflictingDays.length > 0) {
      const conflictNames = conflictingDays.map((d) => dayLabels[d]).join(", ");
      alert(
        `Flere prosjekter konkurrerer om fravær for: ${conflictNames}.\n\nHøyreklikk på dagen du ikke vil registrere fravær for å eksludere den.`,
      );
      setShowAbsencePrompt(true);
      return;
    }
    navigateToAbsence();
  }

  async function handleExportExcel() {
    try {
      const blob = await exportTimesheetExcel(weekStart);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `timesheet-${weekStart}.xlsx`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Excel-eksport feilet:", error);
      alert("Kunne ikke eksportere timeliste til Excel");
    }
  }

  async function handleExportInvoiceBasis() {
    try {
      const blob = await exportInvoiceBasisExcel(weekStart);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `fakturagrunnlag-${weekStart}.xlsx`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Eksport av fakturagrunnlag feilet:", error);
      alert("Kunne ikke eksportere fakturagrunnlag");
    }
  }

  useEffect(() => {
    if (hoursError) {
      const timer = setTimeout(() => setHoursError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [hoursError]);

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
                  {overtimeTotal > 0 && (
                    <span className="overtime-badge">
                      +{overtimeTotal.toFixed(1).replace(".", ",")}
                    </span>
                  )}
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

          <div className="timesheet-columns">
            <span>Prosjekt</span>
            <span>Man</span>
            <span>Tir</span>
            <span>Ons</span>
            <span>Tor</span>
            <span>Fre</span>
            <span>Totalt antall timer</span>
            <span></span>
          </div>

          {visibleProjects.map((project) => (
            <div key={project.workItemId} className="project-row">
              <div className="project-name">
                <strong>{project.name}</strong>
                <span>
                  Oppgave: {project.workItemTitle ?? `Prosjekt #${project.id}`}
                </span>
              </div>
              <div style={{ position: "relative" }}>
                {isOvertime(project.workItemId, "mon") && (
                  <span className="overtime-indicator">
                    +
                    {(getNumericValue(project.workItemId, "mon") - 7.5)
                      .toFixed(1)
                      .replace(".", ",")}
                    t
                  </span>
                )}

                <input
                  value={hours[`${project.workItemId}-mon`] ?? ""}
                  placeholder="0,0"
                  onChange={(e) =>
                    handleChange(project.workItemId, "mon", e.target.value)
                  }
                  onContextMenu={(e) => {
                    e.preventDefault();
                    toggleExcludedFromAbsence(project.workItemId, "mon");
                  }}
                  style={{
                    opacity: excludedFromAbsence[`${project.workItemId}-mon}`]
                      ? 0.3
                      : 1,
                    cursor: excludedFromAbsence[`${project.workItemId}-mon`]
                      ? "not-allowed"
                      : "text",
                  }}
                />
              </div>
              <div style={{ position: "relative" }}>
                {isOvertime(project.workItemId, "tue") && (
                  <span className="overtime-indicator">
                    +
                    {(getNumericValue(project.workItemId, "tue") - 7.5)
                      .toFixed(1)
                      .replace(".", ",")}
                    t
                  </span>
                )}
                <input
                  value={hours[`${project.workItemId}-tue`] ?? ""}
                  placeholder="0,0"
                  onChange={(e) =>
                    handleChange(project.workItemId, "tue", e.target.value)
                  }
                  onContextMenu={(e) => {
                    e.preventDefault();
                    toggleExcludedFromAbsence(project.workItemId, "tue");
                  }}
                  style={{
                    opacity: excludedFromAbsence[`${project.workItemId}-tue`]
                      ? 0.3
                      : 1,
                    cursor: excludedFromAbsence[`${project.workItemId}-tue`]
                      ? "not-allowed"
                      : "text",
                  }}
                />
              </div>
              <div style={{ position: "relative" }}>
                {isOvertime(project.workItemId, "wed") && (
                  <span className="overtime-indicator">
                    +
                    {(getNumericValue(project.workItemId, "wed") - 7.5)
                      .toFixed(1)
                      .replace(".", ",")}
                    t
                  </span>
                )}
                <input
                  value={hours[`${project.workItemId}-wed`] ?? ""}
                  placeholder="0,0"
                  onChange={(e) =>
                    handleChange(project.workItemId, "wed", e.target.value)
                  }
                  onContextMenu={(e) => {
                    e.preventDefault();
                    toggleExcludedFromAbsence(project.workItemId, "wed");
                  }}
                  style={{
                    opacity: excludedFromAbsence[`${project.workItemId}-wed`]
                      ? 0.3
                      : 1,
                    cursor: excludedFromAbsence[`${project.workItemId}-wed`]
                      ? "not-allowed"
                      : "text",
                  }}
                />
              </div>
              <div style={{ position: "relative" }}>
                {isOvertime(project.workItemId, "thu") && (
                  <span className="overtime-indicator">
                    +
                    {(getNumericValue(project.workItemId, "thu") - 7.5)
                      .toFixed(1)
                      .replace(".", ",")}
                    t
                  </span>
                )}
                <input
                  value={hours[`${project.workItemId}-thu`] ?? ""}
                  placeholder="0,0"
                  onChange={(e) =>
                    handleChange(project.workItemId, "thu", e.target.value)
                  }
                  onContextMenu={(e) => {
                    e.preventDefault();
                    toggleExcludedFromAbsence(project.workItemId, "thu");
                  }}
                  style={{
                    opacity: excludedFromAbsence[`${project.workItemId}-thu`]
                      ? 0.3
                      : 1,
                    cursor: excludedFromAbsence[`${project.workItemId}-thu`]
                      ? "not-allowed"
                      : "text",
                  }}
                />
              </div>

              <div style={{ position: "relative" }}>
                {isOvertime(project.workItemId, "fri") && (
                  <span className="overtime-indicator">
                    +
                    {(getNumericValue(project.workItemId, "fri") - 7.5)
                      .toFixed(1)
                      .replace(".", ",")}
                    t
                  </span>
                )}
                <input
                  value={hours[`${project.workItemId}-fri`] ?? ""}
                  placeholder="0,0"
                  onChange={(e) =>
                    handleChange(project.workItemId, "fri", e.target.value)
                  }
                  onContextMenu={(e) => {
                    e.preventDefault();
                    toggleExcludedFromAbsence(project.workItemId, "fri");
                  }}
                  style={{
                    opacity: excludedFromAbsence[`${project.workItemId}-fri`]
                      ? 0.3
                      : 1,
                    cursor: excludedFromAbsence[`${project.workItemId}-fri`]
                      ? "not-allowed"
                      : "text",
                  }}
                />
              </div>
              <div className="total">
                {getRowTotal(project.workItemId).toFixed(1).replace(".", ",")}
              </div>

              <button
                className="delete-btn"
                type="button"
                aria-label="Slett rad"
                onClick={() => removeProject(project.workItemId)}
              >
                <Trash2 size={22} />
              </button>
            </div>
          ))}
          {hoursError && (
            <p
              style={{
                color: "#f59e0b",
                fontSize: "0.85rem",
                margin: "8px 16px",
              }}
            >
              {hoursError}
            </p>
          )}
          <div className="timesheet-actions">
            <button
              className="add-project"
              type="button"
              onClick={() => setIsAddModalOpen(true)}
            >
              + Legg til nytt prosjekt
            </button>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              {showAbsencePrompt && (
                <button
                  className="add-project"
                  type="button"
                  onClick={navigateToAbsence}
                  style={{ borderColor: "rgba(198, 0, 255, 0.6" }}
                >
                  Registrer fravær?
                </button>
              )}
              <button className="save-btn" type="button" onClick={handleSave}>
                Lagre
              </button>
              <button
                className="add-project"
                type="button"
                onClick={handleExportExcel}
              >
                Eksporter Excel
              </button>

              <button
                className="add-project"
                type="button"
                onClick={handleExportInvoiceBasis}
              >
                Eksporter fakturagrunnlag
              </button>
            </div>
          </div>
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

      {isAddModalOpen && (
        <div className="wireframe-modal">
          <div className="modal-content">
            <button
              className="close-btn"
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setSelectedProjectId("");
                setSelectedWorkItemId([]);
                setWorkItems([]);
              }}
            >
              ✕
            </button>

            <div className="input-group-row">
              <label htmlFor="project-select">Prosjekt</label>

              <select
                id="project-select"
                className="dark-input"
                value={selectedProjectId}
                onChange={async (e) => {
                  setSelectedProjectId(e.target.value);
                  setSelectedWorkItemId([]);
                  if (e.target.value) {
                    try {
                      const items = await fetchWorkItems(
                        Number(e.target.value),
                      );
                      setWorkItems(items);
                    } catch (error) {
                      console.error("Kunne ikke hente arbeidsoppgaver:", error);
                    }
                  } else {
                    setWorkItems([]);
                  }
                }}
              >
                <option value="">Velg prosjekt...</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {workItems.length > 0 && (
              <div className="input-group-row">
                <label>Arbeidsoppgave:</label>
                <MultiSelectDropdown
                  options={workItems.map((w) => ({
                    id: w.id,
                    title: w.title,
                    disabled: visibleProjects.some(
                      (p) => p.workItemId === w.id,
                    ),
                  }))}
                  selectedIds={selectedWorkItemId}
                  onChange={setSelectedWorkItemId}
                  placeholder="Velg arbeidsoppgave..."
                />
              </div>
            )}
            <div className="action-buttons">
              <button
                className="save-btn"
                type="button"
                onClick={addSelectedProject}
              >
                Legg til
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
