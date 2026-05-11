import "../styles/TimesheetPage.css";
import { DatePicker, type DatesRangeValue } from "@mantine/dates";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MultiSelectDropdown from "../components/MultiSelectDropdown.tsx";
import { useTimesheet } from "../hooks/useTimesheet.ts";
import { useTimesheetActions } from "../hooks/useTimesheetActions.ts";
import { useAbsenceNavigation } from "../hooks/useAbsenceNavigation.ts";
import { useTimesheetExport } from "../hooks/useTimesheetExport.ts";
import { submitTimesheet } from "../api/timesheetsApi.ts";
import "../../../shared/styles/globals.css";

type TimesheetPageProps = {
  embedded?: boolean;
  hideBackButton?: boolean;
  hideWeekNavigation?: boolean;
  hideExports?: boolean;
  hideCalendarButton?: boolean;
  title?: string;
  subtitle?: string;
  weekStartOverride?: string;
};

function getStatusLabel(status: string | null) {
  switch (status) {
    case "SENT":
      return "Til behandling";
    case "APPROVED":
      return "Godkjent";
    case "REJECTED":
      return "Avvist";
    case "NOT_SENT":
      return "Ikke sendt";
    default:
      return null;
  }
}

export function TimesheetPage({
  embedded = false,
  hideBackButton = false,
  hideWeekNavigation = false,
  hideExports = true,
  hideCalendarButton = false,
  title = "Timeføring",
  subtitle = "Registrer timer for uken og følg totalen din.",
  weekStartOverride,
}: TimesheetPageProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const weekStartFromUrl = searchParams.get("weekStart");
  const effectiveWeekStart = weekStartOverride ?? weekStartFromUrl;

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
    timesheetStatus,
    isLocked,
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
  } = useTimesheet(effectiveWeekStart);

  const absenceProjectNames = ["sykdom", "ferie", "permisjon", "annet"];

  const isAbsenceProject = (projectName: string) =>
    absenceProjectNames.includes(projectName.toLowerCase());

  const normalProjects = visibleProjects.filter(
    (project) => !isAbsenceProject(project.name),
  );

  const absenceProjects = visibleProjects.filter((project) =>
    isAbsenceProject(project.name),
  );

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
    hours,
  });

  async function handleSubmitTimesheet() {
    const saved = await handleSave();

    if (!saved) return;

    await submitTimesheet({ weekStart });
    navigate("/timesheets/saved");
  }

  const showBackButton = !embedded && !hideBackButton;
  const showWeekNavigation = !embedded && !hideWeekNavigation;
  const showCalendarButton = !embedded && !hideCalendarButton;
  const showExports = !embedded && !hideExports;

  const canEditTimesheet = !isLocked;

  const showSubmitButton = !embedded && canEditTimesheet;
  const showDraftButton = canEditTimesheet;
  const showAddProjectButton = canEditTimesheet;
  const showDeleteButton = canEditTimesheet;

  const statusLabel = getStatusLabel(timesheetStatus);

  const earliestAllowed = new Date();
  earliestAllowed.setDate(earliestAllowed.getDate() - 7);
  earliestAllowed.setHours(0, 0, 0, 0);

  const isPastLimit = new Date(weekStart) < earliestAllowed;

  function renderProjectRow(
    project: (typeof visibleProjects)[number],
    isAbsence = false,
  ) {
    return (
      <div
        key={project.workItemId}
        className={
          isAbsence ? "project-row project-row--absence" : "project-row"
        }
      >
        <div className="project-name">
          <strong>{project.name}</strong>
          <span>
            Oppgave: {project.workItemTitle ?? `Prosjekt #${project.id}`}
          </span>
        </div>

        {(["mon", "tue", "wed", "thu", "fri"] as const).map((day) => (
          <div key={day} className="day-input-wrapper">
            {!isAbsence && isOvertime(project.workItemId, day) && (
              <span className="overtime-indicator">
                +
                {(getNumericValue(project.workItemId, day) - 8)
                  .toFixed(1)
                  .replace(".", ",")}
                t
              </span>
            )}

            <input
              value={hours[`${project.workItemId}-${day}`] ?? ""}
              placeholder="0,0"
              disabled={isLocked}
              onChange={(e) =>
                handleChange(project.workItemId, day, e.target.value)
              }
              onContextMenu={(e) => {
                if (isLocked || isAbsence) return;
                e.preventDefault();
                toggleExcludedFromAbsence(project.workItemId, day);
              }}
              className={
                isAbsence
                  ? "timesheet-absence-input"
                  : excludedFromAbsence[`${project.workItemId}-${day}`]
                    ? "input-excluded"
                    : ""
              }
            />
          </div>
        ))}

        <div className={isAbsence ? "total total--absence" : "total"}>
          {getRowTotal(project.workItemId).toFixed(1).replace(".", ",")}
        </div>

        {showDeleteButton && (
          <button
            className="delete-btn"
            type="button"
            aria-label="Slett rad"
            onClick={() => removeProject(project.workItemId)}
          >
            <Trash2 size={22} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={embedded ? "page page--embedded" : "page"}>
      <div
        className={embedded ? "page-shell page-shell--embedded" : "page-shell"}
      >
        <div className="page-intro">
          <div className="page-intro-header">
            {showBackButton && (
              <button
                type="button"
                className="page-back-button"
                onClick={() => navigate("/dashboard")}
              >
                ← Oversikt
              </button>
            )}

            <div className="page-intro-text">
              <h1 className="page-title">{title}</h1>
              <p className="page-subtitle">{subtitle}</p>
            </div>
          </div>
        </div>

        <section
          className={
            embedded
              ? "timesheet-card timesheet-card--embedded"
              : "timesheet-card"
          }
        >
          {statusLabel && (
            <div
              className={`timesheet-status-banner timesheet-status-banner--${timesheetStatus?.toLowerCase()}`}
            >
              {statusLabel}
            </div>
          )}

          <div className="timesheet-header">
            <div className="timesheet-header-left">
              <div className="week-nav-group">
                {showCalendarButton && (
                  <button
                    className="week-icon"
                    type="button"
                    onClick={() => setIsCalendarOpen(true)}
                  >
                    🗓
                  </button>
                )}

                <div>
                  <div className="week-nav">
                    {showWeekNavigation && (
                      <button
                        className="add-project week-nav-btn"
                        type="button"
                        onClick={goToPreviousWeek}
                      >
                        <ChevronLeft size={16} />
                      </button>
                    )}

                    <h5>Uke {weekNumber}</h5>

                    {showWeekNavigation && (
                      <button
                        className="add-project week-nav-btn"
                        type="button"
                        onClick={goToNextWeek}
                      >
                        <ChevronRight size={16} />
                      </button>
                    )}
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
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="timesheet-table">
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

            {normalProjects.map((project) => renderProjectRow(project))}

            {absenceProjects.length > 0 && (
              <>
                <div className="timesheet-section-divider">
                  <span>Fravær</span>
                </div>

                {absenceProjects.map((project) =>
                  renderProjectRow(project, true),
                )}
              </>
            )}
          </div>

          {hoursError && <p className="hours-error">{hoursError}</p>}

          <div className="timesheet-actions">
            {showAddProjectButton && (
              <button
                className="add-project"
                type="button"
                disabled={isPastLimit}
                onClick={() => setIsAddModalOpen(true)}
              >
                + Legg til nytt prosjekt
              </button>
            )}

            <div className="timesheet-actions-right">
              {!isLocked && showAbsencePrompt && (
                <button
                  className="add-project absence-prompt-btn"
                  type="button"
                  onClick={navigateToAbsence}
                >
                  Registrer fravær?
                </button>
              )}

              {isPastLimit && (
                <p className="hours-error">
                  Du kan ikke registrere timer for mer enn en uke tilbake.
                </p>
              )}

              {showDraftButton && (
                <button
                  className={
                    hasUnsavedChanges ? "save-btn" : "save-btn save-btn--saved"
                  }
                  type="button"
                  disabled={isPastLimit}
                  onClick={handleSave}
                >
                  Lagre kladd
                </button>
              )}

              {showSubmitButton && (
                <button
                  className="save-btn save-btn--primary"
                  type="button"
                  disabled={isPastLimit}
                  onClick={handleSubmitTimesheet}
                >
                  Send inn
                </button>
              )}

              {showExports && (
                <>
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
                </>
              )}
            </div>
          </div>
        </section>
      </div>

      {!embedded && isCalendarOpen && (
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

      {isAddModalOpen && !isLocked && (
        <div className="wireframe-modal">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
                className="save-btn save-btn--primary"
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
