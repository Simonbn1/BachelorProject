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
    <div className="absence-form">
      <div className="absence-form-grid">
        <div className="absence-field">
          <label>Årsak til fravær</label>

          <select
            className="dark-input absence-input"
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

        <div className="absence-field absence-field--date">
          <DateRangeInput
            onHoursChange={onHoursChange}
            onRangeChange={onRangeChange}
          />
        </div>

        <div className="absence-field">
          <label>Beskrivelse</label>

          <textarea
            className="dark-input absence-input absence-textarea"
            placeholder="Skriv kort hva fraværet gjelder..."
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
          />
        </div>
      </div>

      <div className="absence-actions">
        <button
          className="save-btn save-btn--primary"
          type="button"
          onClick={onSave}
        >
          Send søknad
        </button>
      </div>
    </div>
  );
}
