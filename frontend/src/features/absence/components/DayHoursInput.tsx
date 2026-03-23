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
};

export default function DayHoursInput({
  hours,
  onHoursChange,
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
        {DAYS.map(({ key, label }) => (
          <input
            key={key}
            className="dark-input"
            value={hours[key] ?? ""}
            onChange={(e) => handleDayChange(key, e.target.value)}
            placeholder={label}
            style={{ width: "70px", textAlign: "center" }}
          />
        ))}
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
