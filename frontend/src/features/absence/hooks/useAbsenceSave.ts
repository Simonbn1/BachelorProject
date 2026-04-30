import type { AbsencePayloadEntry } from "./useAbsence.ts";
import { saveAbsencesFromPayload } from "../api/absenceApi.ts";
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
  absenceType,
  description,
  selectedStartDate,
  selectedEndDate,
  absencePayload,
}: UseAbsenceSaveProps) {
  const { showToast } = useToasts();

  async function handleSave() {
    const authUser = JSON.parse(localStorage.getItem("authUser") ?? "{}");
    const userId = authUser?.id;

    if (!absenceType) {
      showToast(
        "warning",
        "Mangler årsak",
        "Velg årsak til fravær først.",
        true,
      );
      return;
    }

    if (!selectedStartDate || !selectedEndDate) {
      showToast(
        "warning",
        "Mangler periode",
        "Velg en periode for søknaden først.",
        true,
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
        /**
         * Midlertidig løsning uten prosjekt/arbeidsoppgave:
         * Bruker samme payload-funksjon, men bygger én søknads-entry.
         * Backend må enten støtte null/0 workItemId senere,
         * eller så må dere lage en egen absence application-endpoint.
         */
        await saveAbsencesFromPayload(userId, absenceType, description, [
          {
            projectId: 0,
            projectName: "Fravær",
            workItemId: 0,
            workItemTitle: absenceType,
            missingHours: {},
          },
        ]);
      }

      showToast("success", "Søknad sendt!");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Noe gikk galt. Sjekk konsollen";

      showToast("error", "Feil ved innsending", message, true);
    }
  }

  return { handleSave };
}
