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
  timesheetId: number,
  body: AdminDecisionRequest,
): Promise<void> {
  await api.post(`/api/admin/timesheets/${timesheetId}/approve`, body);
}

export async function rejectTimesheet(
  timesheetId: number,
  body: AdminDecisionRequest,
): Promise<void> {
  await api.post(`/api/admin/timesheets/${timesheetId}/reject`, body);
}
