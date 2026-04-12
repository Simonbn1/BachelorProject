import { useEffect, useState } from "react";

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
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        {DAYS.map(({ key, label }) => {
          const isLocked = hasAbsenceParams && !(key in lockedDays);
          const missing = lockedDays[key];
          return (
            <div
              key={key}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                alignItems: "center",
              }}
            >
              {hasAbsenceParams && missing !== undefined && (
                <span
                  style={{
                    fontSize: "0.7rem",
                    color: "#f59e0b",
                  }}
                >
                  mangler {String(missing).replace(".", ",")}t
                </span>
              )}
              <input
                className="dark-input"
                value={hours[getKey(key)] ?? ""}
                onChange={(e) => handleDayChange(key, e.target.value)}
                placeholder={label}
                disabled={isLocked}
                style={{
                  width: "70px",
                  textAlign: "center",
                  opacity: isLocked ? 0.35 : 1,
                  cursor: isLocked ? "not-allowed" : "text",
                }}
              />
            </div>
          );
        })}
        <input
          className="dark-input"
          placeholder="Totalt"
          readOnly
          value={total > 0 ? total : ""}
          style={{ width: "100px", textAlign: "center" }}
        />
      </div>
      {hoursError && (
        <p style={{ color: "#f59e0b", fontSize: "0.85rem", margin: "4px 0 0" }}>
          {hoursError}
        </p>
      )}
    </div>
  );
}
