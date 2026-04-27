import "../../../features/timesheets/styles/TimesheetPage.css";
import AbsenceForm from "../components/AbsenceForm.tsx";
import { useAbsence } from "../hooks/useAbsence.ts";
import { useAbsenceSave } from "../hooks/useAbsenceSave.ts";
import { useAbsenceFillWeek } from "../hooks/useAbsenceFillWeek.ts";
import "../styles/AbsencePage.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
    weekLabel,
    weekNumber,
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
              Registrer sykdom, ferie, permisjon eller annet fravær.
            </p>
          </div>
        </div>

        <section className="timesheet-card">
          <div className="timesheet-header">
            <div className="timesheet-header-left">
              <div className="week-nav-group">
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
    </div>
  );
}
