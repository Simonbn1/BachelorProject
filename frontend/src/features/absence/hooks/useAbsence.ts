import { useCallback, useEffect, useState } from "react";
import type { Project } from "../../projects/types/projects.ts";
import {
  parseLocalDate,
  useTimesheetWeek,
} from "../../timesheets/hooks/useTimesheetWeek.ts";
import { fetchProjects } from "../../projects/api/projectsApi.ts";
import { fetchWorkItems } from "../../timesheets/api/timesheetsApi.ts";

export type AbsencePayloadEntry = {
  projectId: number;
  workItemId: number;
  workItemTitle: string;
  projectName: string;
  missingHours: Record<string, number>;
};

export function useAbsence() {
  const [hours, setHours] = useState<Record<string, string>>({});
  const [absenceType, setAbsenceType] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [projectId, setProjectId] = useState<number | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [workItems, setWorkItems] = useState<{ id: number; title: string }[]>(
    [],
  );
  const [absencePayload, setAbsencePayload] = useState<
    AbsencePayloadEntry[] | null
  >(null);
  const [selectedWorkItemIds, setSelectedWorkItemIds] = useState<number[]>([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [hoursError, setHoursError] = useState<string | null>(null);

  const { weekStart, weekLabel, weekNumber, goToPreviousWeek, goToNextWeek } =
    useTimesheetWeek();

  const startDate = parseLocalDate(weekStart);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 4);

  useEffect(() => {
    const raw = sessionStorage.getItem("absencePayload");
    if (raw) {
      const payload: AbsencePayloadEntry[] = JSON.parse(raw);
      sessionStorage.removeItem("absencePayload");

      const prefilled: Record<string, string> = {};
      for (const entry of payload) {
        for (const [day, missing] of Object.entries(entry.missingHours)) {
          const existing = parseFloat(prefilled[day] ?? "0");
          prefilled[day] = String(parseFloat((existing + missing).toFixed(1)));
        }
      }
      //eslint-disable-next-line react-hooks/set-state-in-effect
      setAbsencePayload(payload);
      setAbsenceType("SICKNESS");
      setHours(prefilled);
    }
  }, []);

  useEffect(() => {
    if (absencePayload) return;
    async function loadProjects() {
      try {
        const data = await fetchProjects();
        setProjects(data);
      } catch (error) {
        console.error("Kunne ikke hente prosjekter:", error);
      }
    }
    loadProjects();
  }, [absencePayload]);

  useEffect(() => {
    if (!projectId || absencePayload) return;
    async function loadWorkItems() {
      try {
        const items = await fetchWorkItems(projectId!);
        setWorkItems(items);
        setSelectedWorkItemIds([]);
      } catch (error) {
        console.error("Kunne ikke hente arbeidsoppgaver:", error);
      }
    }
    loadWorkItems();
  }, [projectId, absencePayload]);

  useEffect(() => {
    if (hoursError) {
      const timer = setTimeout(() => setHoursError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [hoursError]);

  const handleProjectChange = useCallback((id: number) => {
    setProjectId(id);
  }, []);

  const handleRangeChange = useCallback((start: Date, end: Date) => {
    setSelectedStartDate(start);
    setSelectedEndDate(end);
  }, []);

  const handleHoursChange = useCallback((updated: Record<string, string>) => {
    setHours(updated);
  }, []);

  const lockedDaysFromPayload: Record<string, number> = {};
  if (absencePayload) {
    for (const entry of absencePayload) {
      for (const [day, missing] of Object.entries(entry.missingHours)) {
        lockedDaysFromPayload[day] = missing;
      }
    }
  }

  const days = ["mon", "tue", "wed", "thu", "fri"];
  const weekTotal = days.reduce((sum, day) => {
    if (selectedWorkItemIds.length > 0) {
      return (
        sum +
        selectedWorkItemIds.reduce((s, wId) => {
          return (
            s +
            (parseFloat((hours[`${wId}-${day}`] ?? "0").replace(",", ".")) || 0)
          );
        }, 0)
      );
    }
    return sum + (parseFloat((hours[day] ?? "0").replace(",", ".")) || 0);
  }, 0);
  const weeklyTarget = 40;
  const progressPercent = Math.min((weekTotal / weeklyTarget) * 100, 100);

  return {
    // State
    hours,
    setHours,
    absenceType,
    setAbsenceType,
    description,
    setDescription,
    projectId,
    projects,
    selectedStartDate,
    selectedEndDate,
    workItems,
    absencePayload,
    selectedWorkItemIds,
    setSelectedWorkItemIds,
    isCalendarOpen,
    setIsCalendarOpen,
    hoursError,
    // Week
    weekStart,
    weekLabel,
    weekNumber,
    startDate,
    endDate,
    goToPreviousWeek,
    goToNextWeek,
    // Computed
    weekTotal,
    weeklyTarget,
    progressPercent,
    lockedDaysFromPayload,
    days,
    // Handlers
    handleProjectChange,
    handleRangeChange,
    handleHoursChange,
  };
}
