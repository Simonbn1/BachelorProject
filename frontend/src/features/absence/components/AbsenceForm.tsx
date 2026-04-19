import type { Project } from "../../projects/types/projects.ts";
import { useEffect } from "react";
import "../styles/calendar.css";
import DateRangeInput from "./DateRangeInput.tsx";
import DayHoursInput from "./DayHoursInput.tsx";
import MultiSelectDropdown from "../../timesheets/components/MultiSelectDropdown.tsx";
import "../styles/AbsenceForm.css";
import { Trash2 } from "lucide-react";

type AbsenceFormProps = {
  hours: Record<string, string>;
  absenceType: string;
  description: string;
  projectId: number | null;
  workItems: { id: number; title: string }[];
  onHoursChange: (hours: Record<string, string>) => void;
  onRangeChange: (startDate: Date, endDate: Date) => void;
  onTypeChange: (type: string) => void;
  onDescriptionChange: (description: string) => void;
  onProjectChange: (projectId: number) => void;
  onSave: () => void;
  projects: Project[];
  lockedDays: Record<string, number>;
  hasAbsenceParams: boolean;
  hideProjectFields: boolean;
  selectedWorkItemIds?: number[];
  onWorkItemIdsChange: (id: number[]) => void;
  onFillWeek: () => void;
  onRemoveWorkItem?: (id: number) => void;
};

export default function AbsenceForm({
  hours,
  absenceType,
  description,
  projectId,
  workItems,
  onHoursChange,
  onRangeChange,
  onTypeChange,
  onDescriptionChange,
  onProjectChange,
  onSave,
  projects,
  lockedDays,
  hasAbsenceParams,
  hideProjectFields,
  selectedWorkItemIds,
  onWorkItemIdsChange,
  onFillWeek,
  onRemoveWorkItem,
}: AbsenceFormProps) {
  useEffect(() => {
    if (absenceType !== "VACATION" && absenceType !== "LEAVE") {
      onHoursChange({});
    }
  }, [absenceType, onHoursChange]);

  return (
    <>
      {!hideProjectFields && (
        <>
          <div className="input-group-row">
            <label>Prosjekt:</label>

            <select
              className="dark-input"
              value={projectId ?? ""}
              onChange={(e) => onProjectChange(Number(e.target.value))}
            >
              <option value="">
                {projects.length === 0
                  ? "Ingen prosjekter tilgjengelig"
                  : "Velg Prosjekt..."}
              </option>
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
                options={workItems.map((w) => ({ id: w.id, title: w.title }))}
                selectedIds={selectedWorkItemIds ?? []}
                onChange={onWorkItemIdsChange}
                placeholder="Velg arbeidsoppgave..."
              />
            </div>
          )}
        </>
      )}

      <div className="input-group-row">
        <label>Årsak til fravær:</label>
        <select
          className="dark-input"
          value={absenceType}
          onChange={(e) => onTypeChange(e.target.value)}
        >
          <option value="">Velg type...</option>
          <option value="SICKNESS">Sykdom</option>
          <option value="VACATION">Ferie</option>
          <option value="LEAVE">Permisjon</option>
          <option value="OTHER">Annet</option>
        </select>
      </div>
      <hr className="modal-divider" />

      {absenceType === "VACATION" || absenceType === "LEAVE" ? (
        <DateRangeInput
          onHoursChange={onHoursChange}
          onRangeChange={onRangeChange}
        />
      ) : (
        <div className="absence-hours-list">
          {(selectedWorkItemIds ?? []).length > 0 ? (
            <>
              {(selectedWorkItemIds ?? []).map((wId, index) => {
                const workItem = workItems.find((w) => w.id === wId);
                return (
                  <div
                    key={wId}
                    className="input-group-row absence-workitem-row"
                  >
                    {index === 0 ? (
                      <label>Timer denne uka:</label>
                    ) : (
                      <label>&nbsp;</label>
                    )}
                    <div className="absence-workitem-details">
                      <span className="absence-workitem-label">
                        {projects.find((p) => p.id === projectId)?.name} -{" "}
                        {workItem?.title}
                      </span>
                      <DayHoursInput
                        hours={hours}
                        onHoursChange={onHoursChange}
                        lockedDays={lockedDays}
                        hasAbsenceParams={hasAbsenceParams}
                        workItemId={wId}
                      />
                    </div>
                    <button
                      className="delete-btn"
                      type="button"
                      aria-label="Fjern arbeidsoppgave"
                      onClick={() => onRemoveWorkItem?.(wId)}
                    >
                      <Trash2 size={22} />
                    </button>
                  </div>
                );
              })}
            </>
          ) : (
            <div className="input-group-row">
              <label>Timer denne uka:</label>
              <DayHoursInput
                hours={hours}
                onHoursChange={onHoursChange}
                lockedDays={lockedDays}
                hasAbsenceParams={hasAbsenceParams}
              />
            </div>
          )}
          {!hideProjectFields && (
            <div className="absence-fill-week">
              <button
                className="add-project"
                type="button"
                onClick={onFillWeek}
              >
                Fyll uke
              </button>
            </div>
          )}
        </div>
      )}

      <hr className="modal-divider" />
      <div className="absence-description-row">
        <div className="input-group-row">
          <label>Beskrivelse:</label>
          <textarea
            className="dark-input"
            placeholder="Beskrivelse..."
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
          />
        </div>
      </div>
      <div className="timesheet-actions">
        <div />
        <div className="absence-save-row">
          <div />
          <button className="save-btn" type="button" onClick={onSave}>
            Lagre Fravær
          </button>
        </div>
      </div>
    </>
  );
}
