import { useEffect, useState } from "react";
import type { Project } from "../../projects/types/projects.ts";
import { parseLocalDate, useTimesheetWeek } from "./useTimesheetWeek.ts";
import { fetchTimeEntries } from "../api/timesheetsApi.ts";
import { fetchProjects } from "../../projects/api/projectsApi.ts";

export type HoursState = Record<string, string>;
export type ProjectWithWorkItem = Project & {
  workItemId: number;
  workItemTitle: string;
};

export function useTimesheet(initialWeekStart?: string | null) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [visibleProjects, setVisibleProjects] = useState<ProjectWithWorkItem[]>(
    [],
  );
  const [hours, setHours] = useState<HoursState>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [showAbsencePrompt, setShowAbsencePrompt] = useState(false);
  const [workItems, setWorkItems] = useState<{ id: number; title: string }[]>(
    [],
  );
  const [selectedWorkItemId, setSelectedWorkItemId] = useState<number[]>([]);
  const [excludedFromAbsence, setExcludedFromAbsence] = useState<
    Record<string, boolean>
  >({});
  const [hoursError, setHoursError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { weekStart, weekLabel, weekNumber, goToPreviousWeek, goToNextWeek } =
    useTimesheetWeek(initialWeekStart);

  const startDate = parseLocalDate(weekStart);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 4);

  useEffect(() => {
    setHours({});
    setVisibleProjects([]);
    setShowAbsencePrompt(false);
    setHasUnsavedChanges(false);

    async function loadEntries() {
      try {
        const userId = 1;
        const entries = await fetchTimeEntries(userId, weekStart);

        if (entries.length === 0) return;

        const loadedHours: HoursState = {};
        const loadedWorkItems = new Map<
          number,
          { projectId: number; title: string }
        >();

        for (const entry of entries) {
          const projectId = entry.workItem.project.id;
          const workItemId = entry.workItem.id;
          const workItemTitle = entry.workItem.title;
          const date = new Date(entry.entryDate);
          const dayIndex = date.getDay();
          const dayKeys: Record<number, string> = {
            1: "mon",
            2: "tue",
            3: "wed",
            4: "thu",
            5: "fri",
          };
          const day = dayKeys[dayIndex];

          if (day) {
            loadedHours[`${workItemId}-${day}`] = String(entry.hours).replace(
              ".",
              ",",
            );
          }

          loadedWorkItems.set(workItemId, { projectId, title: workItemTitle });
        }

        const loadedProjects: ProjectWithWorkItem[] = [];
        for (const [workItemId, { projectId, title }] of loadedWorkItems) {
          const project = projects.find((p) => p.id === projectId);
          if (project) {
            loadedProjects.push({
              ...project,
              workItemId,
              workItemTitle: title,
            });
          }
        }

        setVisibleProjects(loadedProjects);
        setHours(loadedHours);
      } catch (error) {
        console.error("Kunne ikke hente timeføringer:", error);
      }
    }

    loadEntries();
  }, [weekStart, projects]);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchProjects();
        setProjects(data);
      } catch (error) {
        console.error("Kunne ikke hente prosjekter:", error);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (hoursError) {
      const timer = setTimeout(() => setHoursError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [hoursError]);

  function getNumericValue(workItemId: number, day: string) {
    const raw = hours[`${workItemId}-${day}`] ?? "0";
    return Number.parseFloat(raw.replace(",", ".")) || 0;
  }

  function getRowTotal(workItemId: number) {
    const days = ["mon", "tue", "wed", "thu", "fri"];
    return days.reduce((sum, day) => sum + getNumericValue(workItemId, day), 0);
  }

  const weekTotal = visibleProjects.reduce(
    (sum, project) => sum + getRowTotal(project.workItemId),
    0,
  );

  const weeklyTarget = 40;
  const progressPercent = Math.min((weekTotal / weeklyTarget) * 100, 100);
  const overtimeTotal = Math.max(0, weekTotal - weeklyTarget);

  return {
    projects,
    visibleProjects,
    setVisibleProjects,
    hours,
    setHours,
    isAddModalOpen,
    setIsAddModalOpen,
    selectedProjectId,
    setSelectedProjectId,
    isCalendarOpen,
    setIsCalendarOpen,
    showAbsencePrompt,
    setShowAbsencePrompt,
    workItems,
    setWorkItems,
    selectedWorkItemId,
    setSelectedWorkItemId,
    excludedFromAbsence,
    setExcludedFromAbsence,
    hoursError,
    setHoursError,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    weekStart,
    weekLabel,
    weekNumber,
    startDate,
    endDate,
    goToPreviousWeek,
    goToNextWeek,
    weekTotal,
    weeklyTarget,
    progressPercent,
    overtimeTotal,
    getNumericValue,
    getRowTotal,
  };
}
