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
}: UseAbsenceSaveProps) {
  const { showToast } = useToasts();

  async function handleSave() {
    const authUser = JSON.parse(localStorage.getItem("authUser") ?? "{}");
    const userId = authUser?.id;

    if (!userId) {
      showToast("error", "Feil", "Fant ikke innlogget bruker.");
      return;
    }

    if (!absenceType) {
      showToast("warning", "Mangler årsak", "Velg årsak til fravær først.");
      return;
    }

    if (!selectedStartDate || !selectedEndDate) {
      showToast(
        "warning",
        "Mangler periode",
        "Velg en periode for søknaden først.",
      );
      return;
    }

    try {
      if (absencePayload) {
        await saveAbsencesFromPayload(
          userId,
          absenceType,
          description,
          absencePayload,
        );
      } else {
        await saveAbsences(
          userId,
          absenceType,
          description,
          projectId ?? 0,
          selectedWorkItemIds[0] ?? 0,
          selectedStartDate,
          selectedEndDate,
          hours,
          true,
        );
      }

      showToast("success", "Søknad sendt!", "Fraværssøknaden ble sendt inn.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Noe gikk galt. Sjekk konsollen.";

      showToast("error", "Feil ved innsending", message);
    }
  }

  return { handleSave };
}
