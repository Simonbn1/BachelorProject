import type { HoursState, ProjectWithWorkItem } from "./useTimesheet.ts";
import React from "react";
import { useToasts } from "../../../shared/hooks/useToasts.ts";
import {
  deleteTimeEntries,
  fetchWorkItems,
  saveTimeEntries,
} from "../api/timesheetsApi.ts";

type UseTimesheetActionsProps = {
  hours: HoursState;
  setHours: React.Dispatch<React.SetStateAction<HoursState>>;
  visibleProjects: ProjectWithWorkItem[];
  setVisibleProjects: React.Dispatch<
    React.SetStateAction<ProjectWithWorkItem[]>
  >;
  selectedProjectId: string;
  selectedWorkItemId: number[];
  setSelectedWorkItemId: React.Dispatch<React.SetStateAction<number[]>>;
  setSelectedProjectId: React.Dispatch<React.SetStateAction<string>>;
  workItems: { id: number; title: string }[];
  setWorkItems: React.Dispatch<
    React.SetStateAction<{ id: number; title: string }[]>
  >;
  excludedFromAbsence: Record<string, boolean>;
  setExcludedFromAbsence: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  setHoursError: React.Dispatch<React.SetStateAction<string | null>>;
  setHasUnsavedChanges: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAddModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setShowAbsencePrompt: React.Dispatch<React.SetStateAction<boolean>>;
  weekStart: string;
  startDate: Date;
  getNumericValue: (workItemId: number, day: string) => number;
  navigateToAbsence: () => void;
  projects: import("../../projects/types/projects.ts").Project[];
};

export function useTimesheetActions({
  hours,
  setHours,
  visibleProjects,
  setVisibleProjects,
  selectedProjectId,
  selectedWorkItemId,
  setSelectedWorkItemId,
  setSelectedProjectId,
  workItems,
  setWorkItems,
  setExcludedFromAbsence,
  setHoursError,
  setHasUnsavedChanges,
  setIsAddModalOpen,
  weekStart,
  getNumericValue,
  projects,
}: UseTimesheetActionsProps) {
  const { showToast } = useToasts();

  function handleChange(workItemId: number, day: string, value: string) {
    setHasUnsavedChanges(true);
    const normalized = value.replace(",", ".");
    const key = `${workItemId}-${day}`;

    if (normalized === "" || /^(\d+)?([.]\d{0,1})?$/.test(normalized)) {
      const parsed = parseFloat(normalized);
      if (!isNaN(parsed) && parsed > 16) {
        setHoursError("Du kan ikke registrere mer enn 16 timer per dag.");
        return;
      }
      setHours((prev) => ({
        ...prev,
        [key]: value,
      }));
    }
  }

  function isOvertime(workItemId: number, day: string) {
    return getNumericValue(workItemId, day) > 8;
  }

  function toggleExcludedFromAbsence(workItemId: number, day: string) {
    const key = `${workItemId}-${day}`;
    setExcludedFromAbsence((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  async function removeProject(workItemId: number) {
    const userId = 1;

    try {
      await deleteTimeEntries(userId, weekStart, workItemId);
    } catch (error) {
      console.debug("Kunne ikke hente prosjekter:", error);
    }

    setHours((prev) => {
      const updated = { ...prev };
      const days = ["mon", "tue", "wed", "thu", "fri"];
      for (const day of days) {
        delete updated[`${workItemId}-${day}`];
      }
      return updated;
    });

    setVisibleProjects((prev) =>
      prev.filter((project) => project.workItemId !== workItemId),
    );
  }

  function addSelectedProject() {
    const projectId = Number(selectedProjectId);
    const projectToAdd = projects.find((project) => project.id === projectId);

    if (!projectToAdd || selectedWorkItemId.length === 0) return;

    for (const workItemId of selectedWorkItemId) {
      const workItemToAdd = workItems.find((w) => w.id === workItemId);
      if (!workItemToAdd) continue;

      const alreadyExists = visibleProjects.some(
        (project) => project.workItemId === workItemId,
      );
      if (alreadyExists) continue;

      setVisibleProjects((prev) => [
        ...prev,
        { ...projectToAdd, workItemId, workItemTitle: workItemToAdd.title },
      ]);
    }

    setIsAddModalOpen(false);
    setSelectedProjectId("");
    setSelectedWorkItemId([]);
    setWorkItems([]);
  }

  async function handleSave(): Promise<boolean> {
    const userId = 1;

    if (visibleProjects.length === 0) {
      showToast(
        "warning",
        "Ingen prosjekter",
        "Legg til et prosjekt før du lagrer.",
        true,
      );
      return false;
    }

    try {
      for (const project of visibleProjects) {
        await saveTimeEntries(userId, weekStart, project.workItemId, hours);
      }

      setHasUnsavedChanges(false);
      showToast("success", "Timer lagret!");
      return true;
    } catch (error) {
      console.error("Feil ved lagring:", error);
      showToast(
        "error",
        "Feil ved lagring",
        "Noe gikk galt. Sjekk konsollen",
        true,
      );
      return false;
    }
  }

  async function loadWorkItemsForProject(projectId: string) {
    if (!projectId) {
      setWorkItems([]);
      return;
    }

    try {
      const items = await fetchWorkItems(Number(projectId));
      setWorkItems(items);
    } catch (error) {
      console.error("Kunne ikke hente arbeidsoppgaver:", error);
    }
  }

  return {
    handleChange,
    handleSave,
    removeProject,
    addSelectedProject,
    toggleExcludedFromAbsence,
    isOvertime,
    loadWorkItemsForProject,
  };
}
