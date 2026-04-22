import {
  exportInvoiceBasisExcel,
  exportTimesheetExcel,
} from "../api/timesheetsApi.ts";
import { useToasts } from "../../../shared/hooks/useToasts.ts";
import type { HoursState, ProjectWithWorkItem } from "./useTimesheet.ts";

type UseTimesheetExportProps = {
  weekStart: string;
  visibleProjects: ProjectWithWorkItem[];
  hours: HoursState;
};

export function useTimesheetExport({
  weekStart,
  visibleProjects,
  hours,
}: UseTimesheetExportProps) {
  const { showToast } = useToasts();
  const hasHours = hours
    ? Object.values(hours).some((v) => parseFloat(v.replace(",", ".")) > 0)
    : false;

  async function handleExportExcel() {
    if (visibleProjects.length === 0) {
      showToast(
        "warning",
        "Ingen data",
        "Legg til et prosjekt før du eksporterer.",
        true,
      );
      return;
    }

    if (!hasHours) {
      showToast(
        "warning",
        "Ingen Timer",
        "registrer timer før du eksporterer.",
        true,
      );
      return;
    }

    try {
      const blob = await exportTimesheetExcel(weekStart);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `timesheet-${weekStart}.xlsx`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Excel-eksport feilet:", error);
      showToast(
        "error",
        "Eksport feilet",
        "Kunne ikke eksportere timeliste til Excel",
        true,
      );
    }
  }

  async function handleExportInvoiceBasis() {
    if (visibleProjects.length === 0) {
      showToast(
        "warning",
        "Ingen data",
        "Legg til et prosjekt før du eksporterer.",
        true,
      );
      return;
    }

    if (!hasHours) {
      showToast(
        "warning",
        "Ingen Timer",
        "registrer timer før du eksporterer.",
      );
      return;
    }
    try {
      const blob = await exportInvoiceBasisExcel(weekStart);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `fakturagrunnlag-${weekStart}.xlsx`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Eksport av fakturagrunnlag feilet:", error);
      showToast(
        "error",
        "Eksport feilet",
        "Kunne ikke eksportere fakturagrunnlag",
        true,
      );
    }
  }

  return {
    handleExportExcel,
    handleExportInvoiceBasis,
  };
}
