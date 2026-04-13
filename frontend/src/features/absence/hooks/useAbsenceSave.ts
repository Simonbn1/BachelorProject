import type { AbsencePayloadEntry } from "./useAbsence.ts";
import { saveAbsences, saveAbsencesFromPayload } from "../api/absenceApi.ts";

type UseAbsenceSaveProps = {
  hours: Record<string, string>;
  absenceType: string;
  description: string;
  projectId: number | null;
  selectedStartDate: Date | null;
  selectedEndDate: Date | null;
  selectedWorkItemIds: number[];
  absencePayload: AbsencePayloadEntry[] | null;
  days: string[];
};

export function useAbsenceSave({
  hours,
  absenceType,
  description,
  projectId,
  selectedStartDate,
  selectedEndDate,
  selectedWorkItemIds,
  absencePayload,
  days,
}: UseAbsenceSaveProps) {
  async function handleSave() {
    const userId = Number(localStorage.getItem("userId") ?? "1");
    const isRangeBased = absenceType === "VACATION" || absenceType === "LEAVE";

    if (!absenceType) {
      alert("Velg årsak til fravær først.");
      return;
    }

    if (absencePayload) {
      try {
        await saveAbsencesFromPayload(
          userId,
          absenceType,
          description,
          absencePayload,
        );
        alert("Fravær lagret");
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Noe gikk galt. Sjekk konsollen";
        alert(message);
      }
      return;
    }

    if (!projectId) {
      alert("Velg et prosjekt først.");
      return;
    }

    if (isRangeBased && (!selectedStartDate || !selectedEndDate)) {
      alert("Velg en periode først.");
      return;
    }

    if (!isRangeBased && Object.keys(hours).length === 0) {
      alert("Fyll inn timer for minst en dag.");
      return;
    }

    if (selectedWorkItemIds.length === 0) {
      alert("Velg en arbeidsoppgave først.");
      return;
    }

    try {
      for (const wId of selectedWorkItemIds) {
        const workItemHours: Record<string, string> = {};
        for (const day of days) {
          const val = hours[`${wId}-${day}`];
          if (val) workItemHours[day] = val;
        }
        await saveAbsences(
          userId,
          absenceType,
          description,
          projectId,
          wId,
          selectedStartDate,
          selectedEndDate,
          workItemHours,
          isRangeBased,
        );
      }
      alert("Fravær lagret!");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Noe gikk galt. Sjekk konsollen";
      alert(message);
    }
  }

  return { handleSave };
}
