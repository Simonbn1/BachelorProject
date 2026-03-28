import { api } from "../../../shared/api/client";

export async function fetchTimeEntries(userId: number, weekStart: string) {
  const response = await api.get("api/time-entries", {
    params: { userId, weekStart },
  });
  return response.data;
}

export async function fetchWorkItems(projectId: number) {
  const response = await api.get("api/work-items", {
    params: { projectId },
  });
  return response.data;
}

export async function deleteTimeEntries(
  userId: number,
  weekStart: string,
  workItemId: number,
) {
  await api.delete("api/time-entries", {
    params: { userId, weekStart, workItemId },
  });
}

const DAY_OFFSET: Record<string, number> = {
  mon: 0,
  tue: 1,
  wed: 2,
  thu: 3,
  fri: 4,
};

export async function saveTimeEntries(
  userId: number,
  weekStart: string,
  workItemId: number,
  hours: Record<string, string>,
) {
  const days = ["mon", "tue", "wed", "thu", "fri"];

  for (const day of days) {
    const key = `${workItemId}-${day}`;
    const raw = hours[key] ?? "0";
    const parsedHours = parseFloat(raw.replace(",", ".")) || 0;

    if (parsedHours === 0) continue;

    const entryDate = new Date(weekStart);
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
