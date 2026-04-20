import TopBar from "../../../shared/components/TopBar";
import "../styles/TimesheetPage.css";
import "../styles/TimesheetHeader.css";
import { DatePicker, type DatesRangeValue } from "@mantine/dates";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MultiSelectDropdown from "../components/MultiSelectDropdown.tsx";
import { useTimesheet } from "../hooks/useTimesheet.ts";
import { useTimesheetActions } from "../hooks/useTimesheetActions.ts";
import { useAbsenceNavigation } from "../hooks/useAbsenceNavigation.ts";
import { useTimesheetExport } from "../hooks/useTimesheetExport.ts";

export function TimesheetPage() {
  const navigate = useNavigate();

  const {
    projects,
    visibleProjects,
    setVisibleProjects,
    hours,
    setHours,
    isAddModalOpen,
    setIsAddModalOpen,
    selectedProjectId,
    setSelectedProjectId,
    isCalendarOpen,
    setIsCalendarOpen,
    showAbsencePrompt,
    setShowAbsencePrompt,
    workItems,
    setWorkItems,
    selectedWorkItemId,
    setSelectedWorkItemId,
    excludedFromAbsence,
    setExcludedFromAbsence,
    hoursError,
    setHoursError,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    weekStart,
    weekLabel,
    weekNumber,
    startDate,
    endDate,
    goToPreviousWeek,
    goToNextWeek,
    weekTotal,
    weeklyTarget,
    progressPercent,
    overtimeTotal,
    getNumericValue,
    getRowTotal,
  } = useTimesheet();

  const { navigateToAbsence } = useAbsenceNavigation({
    visibleProjects,
    excludedFromAbsence,
    startDate,
    getNumericValue,
    setShowAbsencePrompt,
  });

  const {
    handleChange,
    handleSave,
    removeProject,
    addSelectedProject,
    toggleExcludedFromAbsence,
    isOvertime,
    loadWorkItemsForProject,
  } = useTimesheetActions({
    hours,
    setHours,
    visibleProjects,
    setVisibleProjects,
    selectedProjectId,
    selectedWorkItemId,
    setSelectedWorkItemId,
    setSelectedProjectId,
    workItems,
    setWorkItems,
    excludedFromAbsence,
    setExcludedFromAbsence,
    setHoursError,
    setHasUnsavedChanges,
    setIsAddModalOpen,
    setShowAbsencePrompt,
    weekStart,
    startDate,
    getNumericValue,
    navigateToAbsence,
    projects,
  });

  const { handleExportExcel, handleExportInvoiceBasis } = useTimesheetExport({
    weekStart,
    visibleProjects,
  });

  return (
    <div className="page">
      <div className="timesheet-shell">
        <TopBar />

        <div className="page-intro">
          <button
            type="button"
            className="page-back-button"
            onClick={() => navigate("/dashboard")}
          >
            ← Oversikt
          </button>

          <div className="page-intro-text">
            <p className="page-kicker">TIMEOPPFØLGING</p>
            <h1 className="page-title">Timeføring</h1>
            <p className="page-subtitle">
              Registrer timer for uken og følg totalen din.
            </p>
          </div>
        </div>

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
                  {weekTotal.toFixed(1).replace(".", ",")} /{" "}
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

              <div className="day-input-wrapper">
                {isOvertime(project.workItemId, "mon") && (
                  <span className="overtime-indicator">
                    +
                    {(getNumericValue(project.workItemId, "mon") - 8)
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
                  className={
                    excludedFromAbsence[`${project.workItemId}-mon`]
                      ? "input-excluded"
                      : ""
                  }
                />
              </div>

              <div className="day-input-wrapper">
                {isOvertime(project.workItemId, "tue") && (
                  <span className="overtime-indicator">
                    +
                    {(getNumericValue(project.workItemId, "tue") - 8)
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
                  className={
                    excludedFromAbsence[`${project.workItemId}-tue`]
                      ? "input-excluded"
                      : ""
                  }
                />
              </div>

              <div className="day-input-wrapper">
                {isOvertime(project.workItemId, "wed") && (
                  <span className="overtime-indicator">
                    +
                    {(getNumericValue(project.workItemId, "wed") - 8)
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
                  className={
                    excludedFromAbsence[`${project.workItemId}-wed`]
                      ? "input-excluded"
                      : ""
                  }
                />
              </div>

              <div className="day-input-wrapper">
                {isOvertime(project.workItemId, "thu") && (
                  <span className="overtime-indicator">
                    +
                    {(getNumericValue(project.workItemId, "thu") - 8)
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
                  className={
                    excludedFromAbsence[`${project.workItemId}-thu`]
                      ? "input-excluded"
                      : ""
                  }
                />
              </div>

              <div className="day-input-wrapper">
                {isOvertime(project.workItemId, "fri") && (
                  <span className="overtime-indicator">
                    +
                    {(getNumericValue(project.workItemId, "fri") - 8)
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
                  className={
                    excludedFromAbsence[`${project.workItemId}-fri`]
                      ? "input-excluded"
                      : ""
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

          {hoursError && <p className="hours-error">{hoursError}</p>}

          <div className="timesheet-actions">
            <button
              className="add-project"
              type="button"
              onClick={() => setIsAddModalOpen(true)}
            >
              + Legg til nytt prosjekt
            </button>

            <div className="timesheet-actions-right">
              {showAbsencePrompt && (
                <button
                  className="add-project absence-prompt-btn"
                  type="button"
                  onClick={navigateToAbsence}
                >
                  Registrer fravær?
                </button>
              )}

              <button
                className={
                  hasUnsavedChanges ? "save-btn" : "save-btn save-btn--saved"
                }
                type="button"
                onClick={handleSave}
              >
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
            className="modal-content modal-content--calendar"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-btn"
              type="button"
              onClick={() => setIsCalendarOpen(false)}
            >
              x
            </button>
            <h5 className="modal-week-title">Uke {weekNumber}</h5>
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
                  await loadWorkItemsForProject(e.target.value);
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
