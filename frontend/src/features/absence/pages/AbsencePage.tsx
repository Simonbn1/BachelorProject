import "../../../features/timesheets/styles/TimesheetPage.css";
import AbsenceForm from "../components/AbsenceForm.tsx";
import { useAbsence } from "../hooks/useAbsence.ts";
import { useAbsenceSave } from "../hooks/useAbsenceSave.ts";
import { useAbsenceFillWeek } from "../hooks/useAbsenceFillWeek.ts";
import "../styles/AbsencePage.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DatePicker, type DatesRangeValue } from "@mantine/dates";
import { useNavigate } from "react-router-dom";

export default function AbsencePage() {
  const navigate = useNavigate();

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
        <div className="page-intro">
          <div className="page-intro-text">
            <button
              type="button"
              className="page-back-button"
              onClick={() => navigate("/dashboard")}
            >
              ← Tilbake til oversikt
            </button>

            <p className="page-kicker">TIMEOPPFØLGING</p>
            <h1 className="page-title">Fravær</h1>
            <p className="page-subtitle">
              Søk om ferie, permisjon eller annet planlagt fravær.
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
          </div>

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
            hideProjectFields={true}
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
