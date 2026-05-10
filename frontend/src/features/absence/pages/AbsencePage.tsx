import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyAbsences, type MyAbsence } from "../api/absenceApi.ts";
import "../../../features/timesheets/styles/TimesheetPage.css";
import AbsenceForm from "../components/AbsenceForm.tsx";
import { useAbsence } from "../hooks/useAbsence.ts";
import { useAbsenceSave } from "../hooks/useAbsenceSave.ts";
import "../../../shared/styles/globals.css";
import "../styles/AbsencePage.css";

type AbsenceTab = "form" | "mine";

type AbsenceGroup = {
  key: string;
  first: MyAbsence;
  last: MyAbsence;
  days: number;
};

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

function getTypeLabel(type: string) {
  switch (type) {
    case "VACATION":
      return "Ferie";
    case "SICKNESS":
      return "Sykdom";
    case "LEAVE":
      return "Permisjon";
    case "OTHER":
      return "Annet";
    default:
      return type;
  }
}

function formatDate(dateString: string) {
  return new Date(`${dateString}T12:00:00`).toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
  });
}

function getNextWorkday(dateString: string) {
  const date = new Date(`${dateString}T12:00:00`);

  do {
    date.setDate(date.getDate() + 1);
  } while (date.getDay() === 0 || date.getDay() === 6);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function groupAbsences(absences: MyAbsence[]): AbsenceGroup[] {
  const sorted = [...absences].sort((a, b) =>
    a.absenceDate.localeCompare(b.absenceDate),
  );

  const groups: MyAbsence[][] = [];

  for (const absence of sorted) {
    const currentGroup = groups[groups.length - 1];
    const previous = currentGroup?.[currentGroup.length - 1];

    const sameRequest =
      previous &&
      previous.type === absence.type &&
      previous.status === absence.status &&
      (previous.description ?? "") === (absence.description ?? "") &&
      (previous.managerComment ?? "") === (absence.managerComment ?? "") &&
      getNextWorkday(previous.absenceDate) === absence.absenceDate;

    if (sameRequest) {
      currentGroup.push(absence);
    } else {
      groups.push([absence]);
    }
  }

  return groups
    .map((group) => ({
      key: `${group[0].id}-${group[group.length - 1].id}`,
      first: group[0],
      last: group[group.length - 1],
      days: group.length,
    }))
    .reverse();
}

export default function AbsencePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AbsenceTab>("form");
  const [myAbsences, setMyAbsences] = useState<MyAbsence[]>([]);
  const [myAbsencesLoading, setMyAbsencesLoading] = useState(false);

  const groupedAbsences = useMemo(
    () => groupAbsences(myAbsences),
    [myAbsences],
  );

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
    await loadMyAbsences();
  }

  return (
    <div className="page">
      <div className="page-shell">
        <div className="page-intro">
          <button
            type="button"
            className="page-back-button"
            onClick={() => navigate("/dashboard")}
          >
            ← Oversikt
          </button>
        </div>

        <div className="absence-content-wrap">
          <section className="timesheet-card absence-card">
            <h1 className="page-title">Fravær</h1>
            <p className="page-subtitle">
              Søk om ferie, permisjon eller annet planlagt fravær.
            </p>
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

                {!myAbsencesLoading && groupedAbsences.length === 0 && (
                  <div className="absence-empty-state">
                    Ingen fraværssøknader å vise enda.
                  </div>
                )}

                {!myAbsencesLoading && groupedAbsences.length > 0 && (
                  <div className="absence-list-table">
                    {groupedAbsences.map((group) => {
                      const { first, last, days } = group;
                      const dateLabel =
                        first.absenceDate === last.absenceDate
                          ? formatDate(first.absenceDate)
                          : `${formatDate(first.absenceDate)} – ${formatDate(
                              last.absenceDate,
                            )}`;

                      return (
                        <div className="absence-list-row" key={group.key}>
                          <div className="absence-list-main">
                            <strong>{getTypeLabel(first.type)}</strong>
                            <span>{dateLabel}</span>
                          </div>

                          <div className="absence-days">
                            {days} {days === 1 ? "dag" : "dager"}
                          </div>

                          <span
                            className={`status-pill ${first.status.toLowerCase()}`}
                          >
                            {getStatusLabel(first.status)}
                          </span>

                          <div className="absence-comment">
                            {first.managerComment || first.description || "—"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
