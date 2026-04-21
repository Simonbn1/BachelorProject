import { api } from "../../../shared/api/client";
import type { MyTimesheet, SubmitTimesheetRequest } from "../types/timesheet";

type DayKey = "mon" | "tue" | "wed" | "thu" | "fri";

const DAYS: DayKey[] = ["mon", "tue", "wed", "thu", "fri"];

const DAY_OFFSET: Record<DayKey, number> = {
  mon: 0,
  tue: 1,
  wed: 2,
  thu: 3,
  fri: 4,
};

export async function fetchTimeEntries(userId: number, weekStart: string) {
  const response = await api.get("/api/time-entries", {
    params: { userId, weekStart },
  });

  return response.data;
}

export async function fetchWorkItems(projectId: number) {
  const response = await api.get("/api/work-items", {
    params: { projectId },
  });

  return response.data;
}

export async function deleteTimeEntries(
  userId: number,
  weekStart: string,
  workItemId: number,
) {
  await api.delete("/api/time-entries", {
    params: { userId, weekStart, workItemId },
  });
}

export async function saveTimeEntries(
  userId: number,
  weekStart: string,
  workItemId: number,
  hours: Record<string, string>,
) {
  for (const day of DAYS) {
    const key = `${workItemId}-${day}`;
    const raw = hours[key] ?? "0";
    const parsedHours = Number.parseFloat(raw.replace(",", ".")) || 0;

    if (parsedHours <= 0) {
      continue;
    }

    const entryDate = new Date(`${weekStart}T00:00:00`);
    entryDate.setDate(entryDate.getDate() + DAY_OFFSET[day]);
    const entryDateStr = entryDate.toISOString().split("T")[0];

    await api.post("/api/time-entries", {
      userId,
      weekStart,
      workItemId,
      entryDate: entryDateStr,
      hours: parsedHours,
      description: "",
    });
  }
}

export async function exportTimesheetExcel(weekStart: string): Promise<Blob> {
  const response = await api.get("/api/timesheets/export/excel", {
    params: { weekStart },
    responseType: "blob",
  });

  return response.data;
}

export async function exportInvoiceBasisExcel(
  weekStart: string,
): Promise<Blob> {
  const response = await api.get("/api/timesheets/export/invoice-basis", {
    params: { weekStart },
    responseType: "blob",
  });

  return response.data;
}

export async function fetchMyTimesheets(): Promise<MyTimesheet[]> {
  const response = await api.get("/api/timesheets/me");
  return response.data;
}

export async function submitTimesheet(payload: SubmitTimesheetRequest) {
  const response = await api.post("/api/timesheets/submit", payload);
  return response.data;
}

export async function deleteTimesheet(timesheetId: number) {
  await api.delete(`/api/timesheets/${timesheetId}`);
}

export async function withdrawTimesheet(timesheetId: number) {
  const response = await api.post(`/api/timesheets/${timesheetId}/withdraw`);
  return response.data;
}
