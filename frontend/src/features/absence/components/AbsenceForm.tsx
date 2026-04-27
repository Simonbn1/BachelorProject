import type { Project } from "../../projects/types/projects.ts";
import "../styles/calendar.css";
import DateRangeInput from "./DateRangeInput.tsx";
import "../styles/AbsenceForm.css";

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
  absenceType,
  description,
  onHoursChange,
  onRangeChange,
  onTypeChange,
  onDescriptionChange,
  onSave,
}: AbsenceFormProps) {
  return (
    <>
      <div className="input-group-row">
        <label>Årsak til fravær:</label>

        <select
          className="dark-input"
          value={absenceType}
          onChange={(e) => {
            onTypeChange(e.target.value);
            onHoursChange({});
          }}
        >
          <option value="">Velg type...</option>
          <option value="VACATION">Ferie</option>
          <option value="LEAVE">Permisjon</option>
          <option value="OTHER">Annet</option>
        </select>
      </div>

      <hr className="modal-divider" />

      <DateRangeInput
        onHoursChange={onHoursChange}
        onRangeChange={onRangeChange}
      />

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
          <button className="save-btn" type="button" onClick={onSave}>
            Send søknad
          </button>
        </div>
      </div>
    </>
  );
}
