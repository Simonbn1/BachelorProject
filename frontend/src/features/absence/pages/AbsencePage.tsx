import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../features/timesheets/styles/TimesheetPage.css";
import AbsenceForm from "../components/AbsenceForm.tsx";
import { useAbsence } from "../hooks/useAbsence.ts";
import { useAbsenceSave } from "../hooks/useAbsenceSave.ts";
import "../styles/AbsencePage.css";
import "../../../shared/styles/globals.css";

type AbsenceTab = "form" | "mine";

export default function AbsencePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AbsenceTab>("form");

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
          <button
            type="button"
            className="page-back-link"
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

        <section className="timesheet-card absence-card">
          <div className="absence-tabs">
            <button
              type="button"
              className={
                activeTab === "form"
                  ? "absence-tab absence-tab--active"
                  : "absence-tab"
              }
              onClick={() => setActiveTab("form")}
            >
              Søk fravær
            </button>

            <button
              type="button"
              className={
                activeTab === "mine"
                  ? "absence-tab absence-tab--active"
                  : "absence-tab"
              }
              onClick={() => setActiveTab("mine")}
            >
              Mine fravær
            </button>
          </div>

          {activeTab === "form" && (
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
                setSelectedWorkItemIds((prev) =>
                  prev.filter((wId) => wId !== id),
                )
              }
            />
          )}

          {activeTab === "mine" && (
            <div className="absence-my-list">
              <h2>Mine fravær</h2>
              <p>Her skal ansatte kunne se status på egne fraværssøknader.</p>

              <div className="absence-empty-state">
                Ingen fraværssøknader å vise enda.
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
