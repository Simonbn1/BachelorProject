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
  onHoursChange: (hours: Record<string, string>) => void;
  onRangeChange: (startDate: Date, endDate: Date) => void;
  onTypeChange: (type: string) => void;
  onDescriptionChange: (description: string) => void;
  onProjectChange: (projectId: number) => void;
  onSave: () => void;
  projects: Project[];
};

export default function AbsenceForm({
  hours,
  absenceType,
  description,
  projectId,
  onHoursChange,
  onRangeChange,
  onTypeChange,
  onDescriptionChange,
  onProjectChange,
  onSave,
  projects,
}: AbsenceFormProps) {
  useEffect(() => {
    if (absenceType !== "VACATION" && absenceType !== "PERMISSION") {
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
          <option value="">Velg Prosjekt...</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      <hr className="modal-divider" />

      {absenceType === "VACATION" || absenceType === "PERMISSION" ? (
        <DateRangeInput
          onHoursChange={onHoursChange}
          onRangeChange={onRangeChange}
        />
      ) : (
        <DayHoursInput hours={hours} onHoursChange={onHoursChange} />
      )}

      <hr className="modal-divider" />

      <div style={{ display: "flex", gap: "40px", marginTop: "16px" }}>
        <div className="input-group-row">
          <label>Beskrivelse</label>
          <textarea
            className="dark-input"
            placeholder="Beskrivelse..."
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
          />
        </div>
      </div>

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
          <option value="PERMISSION">Permisjon</option>
          <option value="OTHER">Annet</option>
        </select>
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
