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
};

export default function DayHoursInput({
  hours,
  onHoursChange,
  lockedDays = {},
  hasAbsenceParams = false,
}: DayHoursInputProps) {
  const total = DAYS.reduce((sum, { key }) => {
    return sum + (parseFloat((hours[key] ?? "0").replace(",", ".")) || 0);
  }, 0);

  function handleDayChange(key: string, value: string) {
    if (value === "" || /^(\d+)?([.,]\d{0,1})?$/.test(value)) {
      onHoursChange({ ...hours, [key]: value });
    }
  }

  return (
    <div className="input-group-row">
      <label>Timer denne uka:</label>
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
                value={hours[key] ?? ""}
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
    </div>
  );
}
