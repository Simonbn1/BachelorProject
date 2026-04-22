import { useEffect, useState } from "react";

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatWeekStart(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatWeekLabel(date: Date): string {
  const end = new Date(date);
  end.setDate(end.getDate() + 4);
  return `${date.getDate()}. ${date.toLocaleString("nb-NO", {
    month: "long",
  })} - ${end.getDate()}. ${end.toLocaleString("nb-NO", { month: "long" })}`;
}

function getWeekNumber(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7,
    )
  );
}

export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function useTimesheetWeek(initialWeekStart?: string | null) {
  const [currentWeek, setCurrentWeek] = useState<Date>(() =>
    initialWeekStart ? parseLocalDate(initialWeekStart) : getMonday(new Date()),
  );

  useEffect(() => {
    if (initialWeekStart) {
      setCurrentWeek(parseLocalDate(initialWeekStart));
    }
  }, [initialWeekStart]);

  function goToPreviousWeek() {
    setCurrentWeek((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  }

  function goToNextWeek() {
    setCurrentWeek((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  }

  return {
    currentWeek,
    weekStart: formatWeekStart(currentWeek),
    weekLabel: formatWeekLabel(currentWeek),
    weekNumber: getWeekNumber(currentWeek),
    goToPreviousWeek,
    goToNextWeek,
  };
}
