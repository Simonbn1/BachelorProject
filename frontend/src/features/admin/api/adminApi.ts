import { api } from "../../../shared/api/client";
import type {
  AdminDecisionRequest,
  AdminTimesheetDetail,
  AdminTimesheetSummary,
} from "../types/admin";

export async function fetchAdminTimesheets(
  weekStart: string,
): Promise<AdminTimesheetSummary[]> {
  const response = await api.get<AdminTimesheetSummary[]>(
    `/api/admin/timesheets?weekStart=${weekStart}`,
  );
  return response.data;
}

export async function fetchAdminTimesheetDetail(
  timesheetId: number,
): Promise<AdminTimesheetDetail> {
  const response = await api.get<AdminTimesheetDetail>(
    `/api/admin/timesheets/${timesheetId}`,
  );
  return response.data;
}

export async function approveTimesheet(
  body: AdminDecisionRequest,
): Promise<void> {
  await api.post("/api/approvals/approve", body);
}

export async function rejectTimesheet(
  body: AdminDecisionRequest,
): Promise<void> {
  await api.post("/api/approvals/reject", body);
}

export async function exportAdminInvoiceBasisExcel(weekStart: string) {
  const response = await api.get("/api/admin/export/invoice-basis", {
    params: { weekStart },
    responseType: "blob",
  });

  return response.data;
}
