import { useEffect, useState } from "react";
import { fetchProjects } from "../../projects/api/projectsApi";
import type { Project } from "../../projects/types/projects";
import TopBar from "../../../shared/components/TopBar";
import {
  deleteTimeEntries,
  fetchTimeEntries,
  fetchWorkItems,
  saveTimeEntries,
} from "../api/timesheetsApi.ts";
import { useTimesheetWeek, parseLocalDate } from "../hooks/useTimesheetWeek.ts";
import "../styles/TimesheetHeader.css";
import { DatePicker, type DatesRangeValue } from "@mantine/dates";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  const [selectedWorkItemId, setSelectedWorkItemId] = useState("");

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

  function buildAbsenceParams(): URLSearchParams {
    const days = ["mon", "tue", "wed", "thu", "fri"];
    const params = new URLSearchParams();
    for (const day of days) {
      const totalWorked = visibleProjects.reduce(
        (sum, project) => sum + getNumericValue(project.workItemId, day),
        0,
      );
      if (totalWorked > 0 && totalWorked < 7.5) {
        params.set(day, String(7.5 - totalWorked));
      } else if (totalWorked === 0) {
        params.set(day, "7.5");
      }
    }
    return params;
  }

  function addSelectedProject() {
    const projectId = Number(selectedProjectId);
    const workItemId = Number(selectedWorkItemId);
    const projectToAdd = projects.find((project) => project.id === projectId);
    const workItemToAdd = workItems.find((w) => w.id === workItemId);

    if (!projectToAdd || !workItemToAdd) {
      return;
    }

    const alreadyExists = visibleProjects.some(
      (project) => project.workItemId === workItemId,
    );

    if (alreadyExists) {
      setIsAddModalOpen(false);
      setSelectedProjectId("");
      setWorkItems([]);
      return;
    }

    setVisibleProjects((prev) => [
      ...prev,
      { ...projectToAdd, workItemId, workItemTitle: workItemToAdd.title },
    ]);
    setIsAddModalOpen(false);
    setSelectedProjectId("");
    setWorkItems([]);
  }

  // Save the project to the database
  async function handleSave() {
    const userId = 1;
    const missing = (weeklyTarget - weekTotal).toFixed(1).replace(".", ",");

    const absenceMessage = [
      `Du har bare registrert ${weekTotal.toFixed(1).replace(".", ",")} av ${weeklyTarget.toFixed(1).replace(".", ",")} timer denne uken.`,
      `Du mangler ${missing} timer.`,
      `Ønsker du å registrere fravær for de resterende timene?`,
    ].join(" ");

    if (weekTotal < weeklyTarget) {
      const confirm = window.confirm(absenceMessage);

      if (confirm) {
        try {
          for (const project of visibleProjects) {
            await saveTimeEntries(userId, weekStart, project.workItemId, hours);
          }
        } catch (error) {
          console.error("Feil ved lagring:", error);
          alert("Noe gikkm galt ved lagring. Sjekk konsollen.");
          return;
        }

        navigate(`/absence?${buildAbsenceParams().toString()}`);
        return;
      } else {
        setShowAbsencePrompt(true);
        return;
      }
    }

    try {
      for (const project of visibleProjects) {
        await saveTimeEntries(userId, weekStart, project.workItemId, hours);
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
                  onClick={() => {
                    navigate(`/absence?${buildAbsenceParams().toString()}`);
                  }}
                  style={{ borderColor: "rgba(198, 0, 255, 0.6" }}
                >
                  Registrer fravær?
                </button>
              )}
              <button className="save-btn" type="button" onClick={handleSave}>
                Lagre
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
                setSelectedWorkItemId("");
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
                  setSelectedWorkItemId("");
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
                <label htmlFor="Arbeidsoppgave"></label>
                <select
                  id="workitem-select"
                  className="dark-input"
                  value={selectedWorkItemId}
                  onChange={(e) => setSelectedWorkItemId(e.target.value)}
                >
                  <option value="">Velg Arbeidsoppgave...</option>
                  {workItems.map((workItem) => (
                    <option key={workItem.id} value={workItem.id}>
                      {workItem.title}
                    </option>
                  ))}
                </select>
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
