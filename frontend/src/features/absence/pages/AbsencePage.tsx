import "../../../features/timesheets/styles/TimesheetPage.css";
import AbsenceForm from "../components/AbsenceForm.tsx";
import { useAbsence } from "../hooks/useAbsence.ts";
import { useAbsenceSave } from "../hooks/useAbsenceSave.ts";
import "../styles/AbsencePage.css";
import { useNavigate } from "react-router-dom";
import "../../../shared/styles/globals.css";

export default function AbsencePage() {
  const navigate = useNavigate();

  const {
    hours,
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
    lockedDaysFromPayload,
    days,
    handleProjectChange,
    handleRangeChange,
    handleHoursChange,
  } = useAbsence();

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
      <div className="page-shell">
        <div className="page-intro">
          <div className="page-intro-header">
            <button
              type="button"
              className="page-back-button"
              onClick={() => navigate("/dashboard")}
            >
              ← Oversikt
            </button>

            <div className="page-intro-text">
              <h1 className="page-title">Fravær</h1>
              <p className="page-subtitle">
                Søk om ferie, permisjon eller annet planlagt fravær.
              </p>
            </div>
          </div>
        </div>

        <section className="timesheet-card absence-card">
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
            onFillWeek={() => {}}
            onRemoveWorkItem={(id) =>
              setSelectedWorkItemIds((prev) => prev.filter((wId) => wId !== id))
            }
          />
        </section>
      </div>
    </div>
  );
}
