import "../../../features/timesheets/styles/TimesheetPage.css";
import AbsenceForm from "../components/AbsenceForm.tsx";
import { useAbsence } from "../hooks/useAbsence.ts";
import { useAbsenceSave } from "../hooks/useAbsenceSave.ts";
import { useAbsenceFillWeek } from "../hooks/useAbsenceFillWeek.ts";
import "../styles/AbsencePage.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DatePicker, type DatesRangeValue } from "@mantine/dates";

export default function AbsencePage() {
  const {
    hours,
    setHours,
    absenceType,
    setAbsenceType,
    description,
    setDescription,
    projectId,
    projects,
    selectedStartDate,
    selectedEndDate,
    workItems,
    absencePayload,
    selectedWorkItemIds,
    setSelectedWorkItemIds,
    isCalendarOpen,
    setIsCalendarOpen,
    weekLabel,
    weekNumber,
    startDate,
    endDate,
    goToPreviousWeek,
    goToNextWeek,
    weekTotal,
    weeklyTarget,
    progressPercent,
    lockedDaysFromPayload,
    days,
    handleProjectChange,
    handleRangeChange,
    handleHoursChange,
  } = useAbsence();

  const { handleFillWeek } = useAbsenceFillWeek({
    hours,
    selectedWorkItemIds,
    setHours,
  });

  const { handleSave } = useAbsenceSave({
    hours,
    absenceType,
    description,
    projectId,
    selectedStartDate,
    selectedEndDate,
    selectedWorkItemIds,
    absencePayload,
    days,
  });

  return (
    <div className="page">
      <div className="timesheet-shell">
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

          {absencePayload && (
            <div className="absence-payload-summary">
              <p className="absence-payload-label">Fravær registreres for:</p>

              {absencePayload.map((entry) => (
                <div key={entry.workItemId} className="absence-payload-entry">
                  <strong>{entry.projectName}</strong> - {entry.workItemTitle}
                  <span className="absence-payload-hours">
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
            onRemoveWorkItem={(id) =>
              setSelectedWorkItemIds((prev) => prev.filter((wId) => wId !== id))
            }
          />
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
    </div>
  );
}
