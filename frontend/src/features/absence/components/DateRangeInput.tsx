import { useState } from "react";
import { DatePickerInput } from "@mantine/dates";
import type { DatesRangeValue } from "@mantine/dates";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import { MantineProvider, createTheme } from "@mantine/core";

type DateRangeInputProps = {
  onHoursChange: (hours: Record<string, string>) => void;
};

const DAY_KEYS: Record<number, string> = {
  1: "mon",
  2: "tue",
  3: "wed",
  4: "thu",
  5: "fri",
};

export default function DateRangeInput({ onHoursChange }: DateRangeInputProps) {
  const [value, setValue] = useState<DatesRangeValue>([null, null]);

  const theme = createTheme({
    primaryColor: "violet",
  });

  function handleChange(val: DatesRangeValue) {
    setValue(val);
    const [startDate, endDate] = val;
    if (!startDate || !endDate) return;

    const updated: Record<string, string> = {};
    const cur = new Date(startDate);
    const end = new Date(endDate);

    while (cur <= end) {
      const d = cur.getDay();
      if (d >= 1 && d <= 5) updated[DAY_KEYS[d]] = "7.5";
      cur.setDate(cur.getDate() + 1);
    }
    onHoursChange(updated);
  }

  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <div className="input-group-row" style={{ alignItems: "flex-start" }}>
        <label style={{ paddingTop: "12px" }}>Periode:</label>
        <DatePickerInput
          type="range"
          placeholder="Velg periode..."
          value={value}
          onChange={handleChange}
          locale="nb"
          weekendDays={[0, 6]}
          excludeDate={(date) =>
            new Date(date).getDay() === 0 || new Date(date).getDay() === 6
          }
          numberOfColumns={2}
          style={{ width: "400px" }}
          styles={{
            input: {
              backgroundColor: "#2e335a",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "white",
              borderRadius: "10px",
            },
          }}
        />
      </div>
    </MantineProvider>
  );
}
