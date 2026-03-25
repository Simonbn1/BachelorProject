import { useEffect, useState } from "react";
import { fetchProjects } from "../../projects/api/projectsApi";
import type { Project } from "../../projects/types/projects";
import TopBar from "../../../shared/components/TopBar";
import { saveTimeEntries } from "../api/timesheetsApi.ts";
import { useTimesheetWeek, parseLocalDate } from "../hooks/useTimesheetWeek.ts";
import "../styles/TimesheetHeader.css";
import { DatePicker, type DatesRangeValue } from "@mantine/dates";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";

type HoursState = Record<string, string>;

export function TimesheetPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [visibleProjects, setVisibleProjects] = useState<Project[]>([]);
  const [hours, setHours] = useState<HoursState>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const { weekStart, weekLabel, weekNumber, goToPreviousWeek, goToNextWeek } =
    useTimesheetWeek();

  const startDate = parseLocalDate(weekStart);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 4);

  useEffect(() => {
    setHours({});
    setVisibleProjects([]);
  }, [weekStart]);

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

  function handleChange(projectId: number, day: string, value: string) {
    const normalized = value.replace(",", ".");
    const key = `${projectId}-${day}`;

    if (normalized === "" || /^(\d+)?([.]\d{0,1})?$/.test(normalized)) {
      setHours((prev) => ({
        ...prev,
        [key]: value,
      }));
    }
  }

  function isOvertime(projectId: number, day: string) {
    return getNumericValue(projectId, day) > 7.5;
  }

  function getNumericValue(projectId: number, day: string) {
    const raw = hours[`${projectId}-${day}`] ?? "0";
    return Number.parseFloat(raw.replace(",", ".")) || 0;
  }

  function getRowTotal(projectId: number) {
    const days = ["mon", "tue", "wed", "thu", "fri"];
    return days.reduce((sum, day) => sum + getNumericValue(projectId, day), 0);
  }

  const weekTotal = visibleProjects.reduce(
    (sum, project) => sum + getRowTotal(project.id),
    0,
  );

  const weeklyTarget = 37.5;
  const progressPercent = Math.min((weekTotal / weeklyTarget) * 100, 100);
  const overtimeTotal = Math.max(0, weekTotal - weeklyTarget);

  function removeProject(projectId: number) {
    setVisibleProjects((prev) =>
      prev.filter((project) => project.id !== projectId),
    );
  }

  function addSelectedProject() {
    const projectId = Number(selectedProjectId);
    const projectToAdd = projects.find((project) => project.id === projectId);

    if (!projectToAdd) {
      return;
    }

    const alreadyExists = visibleProjects.some(
      (project) => project.id === projectId,
    );

    if (alreadyExists) {
      setIsAddModalOpen(false);
      setSelectedProjectId("");
      return;
    }

    setVisibleProjects((prev) => [...prev, projectToAdd]);
    setIsAddModalOpen(false);
    setSelectedProjectId("");
  }

  // Save the project to the database
  async function handleSave() {
    const userId = 1;

    try {
      for (const project of visibleProjects) {
        await saveTimeEntries(userId, weekStart, project.id, hours);
      }
      alert("Timer lagret!");
    } catch (error) {
      console.error("Feil ved lagring:", error);
      alert("Noe gikk galt ved lagring. Sjekk konsollen.");
    }
  }

  return (
    <div className="page">
      <div className="timesheet-shell">
        <TopBar userName="Kari Nordmann" />

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
            <div key={project.id} className="project-row">
              <div className="project-name">
                <strong>{project.name}</strong>
                <span>Prosjekt #{project.id}</span>
              </div>
              <div style={{ position: "relative" }}>
                {isOvertime(project.id, "mon") && (
                  <span className="overtime-indicator">
                    +
                    {(getNumericValue(project.id, "mon") - 7.5)
                      .toFixed(1)
                      .replace(".", ",")}
                    t
                  </span>
                )}

                <input
                  value={hours[`${project.id}-mon`] ?? ""}
                  placeholder="0,0"
                  onChange={(e) =>
                    handleChange(project.id, "mon", e.target.value)
                  }
                />
              </div>
              <div style={{ position: "relative" }}>
                {isOvertime(project.id, "tue") && (
                  <span className="overtime-indicator">
                    +
                    {(getNumericValue(project.id, "tue") - 7.5)
                      .toFixed(1)
                      .replace(".", ",")}
                    t
                  </span>
                )}
                <input
                  value={hours[`${project.id}-tue`] ?? ""}
                  placeholder="0,0"
                  onChange={(e) =>
                    handleChange(project.id, "tue", e.target.value)
                  }
                />
              </div>
              <div style={{ position: "relative" }}>
                {isOvertime(project.id, "wed") && (
                  <span className="overtime-indicator">
                    +
                    {(getNumericValue(project.id, "wed") - 7.5)
                      .toFixed(1)
                      .replace(".", ",")}
                    t
                  </span>
                )}
                <input
                  value={hours[`${project.id}-wed`] ?? ""}
                  placeholder="0,0"
                  onChange={(e) =>
                    handleChange(project.id, "wed", e.target.value)
                  }
                />
              </div>
              <div style={{ position: "relative" }}>
                {isOvertime(project.id, "thu") && (
                  <span className="overtime-indicator">
                    +
                    {(getNumericValue(project.id, "thu") - 7.5)
                      .toFixed(1)
                      .replace(".", ",")}
                    t
                  </span>
                )}
                <input
                  value={hours[`${project.id}-thu`] ?? ""}
                  placeholder="0,0"
                  onChange={(e) =>
                    handleChange(project.id, "thu", e.target.value)
                  }
                />
              </div>

              <div style={{ position: "relative" }}>
                {isOvertime(project.id, "fri") && (
                  <span className="overtime-indicator">
                    +
                    {(getNumericValue(project.id, "fri") - 7.5)
                      .toFixed(1)
                      .replace(".", ",")}
                    t
                  </span>
                )}
                <input
                  value={hours[`${project.id}-fri`] ?? ""}
                  placeholder="0,0"
                  onChange={(e) =>
                    handleChange(project.id, "fri", e.target.value)
                  }
                />
              </div>
              <div className="total">
                {getRowTotal(project.id).toFixed(1).replace(".", ",")}
              </div>

              <button
                className="delete-btn"
                type="button"
                aria-label="Slett rad"
                onClick={() => removeProject(project.id)}
              >
                <Trash2 size={22} />
              </button>
            </div>
          ))}

          <div className="timesheet-actions">
            <button
              className="add-project"
              type="button"
              onClick={() => setIsAddModalOpen(true)}
            >
              + Legg til nytt prosjekt
            </button>
            <button className="save-btn" type="button" onClick={handleSave}>
              Lagre
            </button>
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
              onClick={() => setIsAddModalOpen(false)}
            >
              ✕
            </button>

            <div className="input-group-row">
              <label htmlFor="project-select">Prosjekt</label>

              <select
                id="project-select"
                className="dark-input"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
              >
                <option value="">Velg prosjekt...</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

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
