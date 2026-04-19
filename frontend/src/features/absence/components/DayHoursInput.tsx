import { useEffect, useState } from "react";
import "../styles/DayHoursInput.css";

const DAYS = [
  { key: "mon", label: "Man" },
  { key: "tue", label: "Tir" },
  { key: "wed", label: "Ons" },
  { key: "thu", label: "Tor" },
  { key: "fri", label: "Fre" },
];

type DayHoursInputProps = {
  hours: Record<string, string>;
  onHoursChange: (hours: Record<string, string>) => void;
  lockedDays?: Record<string, number>;
  hasAbsenceParams?: boolean;
  workItemId?: number;
};

export default function DayHoursInput({
  hours,
  onHoursChange,
  lockedDays = {},
  hasAbsenceParams = false,
  workItemId,
}: DayHoursInputProps) {
  const [hoursError, setHoursError] = useState<string | null>(null);
  function getKey(day: string) {
    return workItemId !== undefined ? `${workItemId}-${day}` : day;
  }

  const total = DAYS.reduce((sum, { key }) => {
    return (
      sum + (parseFloat((hours[getKey(key)] ?? "0").replace(",", ".")) || 0)
    );
  }, 0);

  useEffect(() => {
    if (hoursError) {
      const timer = setTimeout(() => setHoursError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [hoursError]);

  function handleDayChange(key: string, value: string) {
    if (value === "" || /^(\d+)?([.,]\d{0,1})?$/.test(value)) {
      const parsed = parseFloat(value.replace(",", "."));
      if (!isNaN(parsed) && parsed > 16) {
        setHoursError("Du kan ikke registrere mer enn 16 timer per dag");
        return;
      }
      onHoursChange({ ...hours, [getKey(key)]: value });
    }
  }

  return (
    <div className="day-hours-wrapper">
      <div className="day-hours-row">
        {DAYS.map(({ key, label }) => {
          const isLocked = hasAbsenceParams && !(key in lockedDays);
          const missing = lockedDays[key];
          return (
            <div key={key} className="day-hours-cell">
              {hasAbsenceParams && missing !== undefined && (
                <span className="day-hours-missing">
                  mangler {String(missing).replace(".", ",")}t
                </span>
              )}
              <input
                className={`dark-input day-hours-input${isLocked ? " day-hours-input--locked" : ""}`}
                value={hours[getKey(key)] ?? ""}
                onChange={(e) => handleDayChange(key, e.target.value)}
                placeholder={label}
                disabled={isLocked}
              />
            </div>
          );
        })}
        <input
          className="dark-input day-hours-total"
          placeholder="Totalt"
          readOnly
          value={total > 0 ? total : ""}
        />
      </div>
      {hoursError && <p className="day-hours-error">{hoursError}</p>}
    </div>
  );
}
