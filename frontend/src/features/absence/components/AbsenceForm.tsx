import type { Project } from "../../projects/types/projects.ts";
import { useEffect } from "react";
import "../styles/calendar.css";
import DateRangeInput from "./DateRangeInput.tsx";
import DayHoursInput from "./DayHoursInput.tsx";

type AbsenceFormProps = {
  hours: Record<string, string>;
  absenceType: string;
  description: string;
  projectId: number | null;
  workItems: { id: number; title: string }[];
  workItemId: number | null;
  onHoursChange: (hours: Record<string, string>) => void;
  onRangeChange: (startDate: Date, endDate: Date) => void;
  onTypeChange: (type: string) => void;
  onDescriptionChange: (description: string) => void;
  onProjectChange: (projectId: number) => void;
  onWorkItemChange: (workItemId: number) => void;
  onSave: () => void;
  projects: Project[];
  lockedDays: Record<string, number>;
  hasAbsenceParams: boolean;
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
  onWorkItemChange,
  onSave,
  projects,
  lockedDays,
  hasAbsenceParams,
}: AbsenceFormProps) {
  useEffect(() => {
    if (absenceType !== "VACATION" && absenceType !== "LEAVE") {
      onHoursChange({});
    }
  }, [absenceType, onHoursChange]);

  return (
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
              ? "Registrer timer i timeplanen først"
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
          <select
            className="dark-input"
            value={projectId ?? ""}
            onChange={(e) => onWorkItemChange(Number(e.target.value))}
          >
            <option value="">Velg Arbeidsoppgave...</option>
            {workItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </div>
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
        <DayHoursInput
          hours={hours}
          onHoursChange={onHoursChange}
          lockedDays={lockedDays}
          hasAbsenceParams={hasAbsenceParams}
        />
      )}

      <hr className="modal-divider" />

      <div style={{ display: "flex", gap: "40px", marginTop: "16px" }}>
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
        <button className="save-btn" type="button" onClick={onSave}>
          Lagre Fravær
        </button>
      </div>
    </>
  );
}
