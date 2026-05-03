import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyAbsences, type MyAbsence } from "../api/absenceApi.ts";
import "../../../features/timesheets/styles/TimesheetPage.css";
import AbsenceForm from "../components/AbsenceForm.tsx";
import { useAbsence } from "../hooks/useAbsence.ts";
import { useAbsenceSave } from "../hooks/useAbsenceSave.ts";
import "../styles/AbsencePage.css";
import "../../../shared/styles/globals.css";

type AbsenceTab = "form" | "mine";

function getStatusLabel(status: MyAbsence["status"]) {
  switch (status) {
    case "PENDING":
      return "Til behandling";
    case "APPROVED":
      return "Godkjent";
    case "REJECTED":
      return "Avvist";
    default:
      return status;
  }
}

export default function AbsencePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AbsenceTab>("form");
  const [myAbsences, setMyAbsences] = useState<MyAbsence[]>([]);
  const [myAbsencesLoading, setMyAbsencesLoading] = useState(false);

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

  async function loadMyAbsences() {
    try {
      setMyAbsencesLoading(true);
      const data = await fetchMyAbsences();
      setMyAbsences(data);
    } catch (error) {
      console.error("Kunne ikke hente mine fravær:", error);
    } finally {
      setMyAbsencesLoading(false);
    }
  }

  useEffect(() => {
    if (activeTab === "mine") {
      loadMyAbsences();
    }
  }, [activeTab]);

  async function handleSaveAndRefresh() {
    await handleSave();

    if (activeTab === "mine") {
      await loadMyAbsences();
    }
  }

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
              onSave={handleSaveAndRefresh}
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
              <p>Her kan du se status på egne fraværssøknader.</p>

              {myAbsencesLoading && (
                <div className="absence-empty-state">Laster fravær...</div>
              )}

              {!myAbsencesLoading && myAbsences.length === 0 && (
                <div className="absence-empty-state">
                  Ingen fraværssøknader å vise enda.
                </div>
              )}

              {!myAbsencesLoading && myAbsences.length > 0 && (
                <div className="absence-list-table">
                  {myAbsences.map((absence) => (
                    <div className="absence-list-row" key={absence.id}>
                      <div>
                        <strong>{absence.absenceDate}</strong>
                        <span>{absence.type}</span>
                      </div>

                      <div>{absence.hours}t</div>

                      <span
                        className={`status-pill ${absence.status.toLowerCase()}`}
                      >
                        {getStatusLabel(absence.status)}
                      </span>

                      <div>
                        {absence.managerComment || absence.description || "—"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
