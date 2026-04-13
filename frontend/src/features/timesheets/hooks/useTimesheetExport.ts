import {
  exportInvoiceBasisExcel,
  exportTimesheetExcel,
} from "../api/timesheetsApi.ts";

type UseTimesheetExportProps = {
  weekStart: string;
};

export function useTimesheetExport({ weekStart }: UseTimesheetExportProps) {
  async function handleExportExcel() {
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
      alert("Kunne ikke eksportere timeliste til Excel");
    }
  }

  async function handleExportInvoiceBasis() {
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
      alert("Kunne ikke eksportere fakturagrunnlag");
    }
  }

  return {
    handleExportExcel,
    handleExportInvoiceBasis,
  };
}
