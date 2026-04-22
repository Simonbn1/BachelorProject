import type { AbsencePayloadEntry } from "./useAbsence.ts";
import { saveAbsences, saveAbsencesFromPayload } from "../api/absenceApi.ts";
import { useToasts } from "../../../shared/hooks/useToasts.ts";

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
  const { showToast } = useToasts();

  async function handleSave() {
    const userId = Number(localStorage.getItem("userId") ?? "1");
    const isRangeBased = absenceType === "VACATION" || absenceType === "LEAVE";

    if (!absenceType) {
      showToast(
        "warning",
        "Mangler årsak",
        "Velg årsak til fravær først.",
        true,
      );
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
        showToast("success", "Fravær lagret");
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Noe gikk galt. Sjekk konsollen";
        showToast("error", "Feil ved lagring", message, true);
      }
      return;
    }

    if (!projectId) {
      showToast("warning", "Mangler prosjekt", "Velg et prosjekt først.", true);
      return;
    }

    if (isRangeBased && (!selectedStartDate || !selectedEndDate)) {
      showToast("warning", "Mangler periode", "Velg en periode først.", true);
      return;
    }

    if (!isRangeBased && Object.keys(hours).length === 0) {
      showToast(
        "warning",
        "Mangler timer",
        "Fyll inn timer for minst en dag.",
        true,
      );
      return;
    }

    if (selectedWorkItemIds.length === 0) {
      showToast(
        "warning",
        "Mangler arbeidsoppgave",
        "Velg en arbeidsoppgave først.",
        true,
      );
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
      showToast("success", "Fravær lagret!");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Noe gikk galt. Sjekk konsollen";
      showToast("error", "Feil ved lagring", message, true);
    }
  }

  return { handleSave };
}
