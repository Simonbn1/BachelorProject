import { api } from "../../../shared/api/client";

const DAY_OFFSET: Record<string, number> = {
  mon: 0,
  tue: 1,
  wed: 2,
  thu: 3,
  fri: 4,
};

/*async function getFirstWorkItemId(projectId: number): Promise<number | null> {
  const res = await api.get(`/api/projects/${projectId}/work-items`);
  const items = res.data;
  return items.length > 0 ? items[0].id : null;
}
*/
export async function saveTimeEntries(
  userId: number,
  weekStart: string,
  projectId: number,
  hours: Record<string, string>,
) {
  const days = ["mon", "tue", "wed", "thu", "fri"];

  for (const day of days) {
    const key = `${projectId}-${day}`;
    const raw = hours[key] ?? "0";
    const parsedHours = parseFloat(raw.replace(",", ".")) || 0;

    const entryDate = new Date(weekStart);
    entryDate.setDate(entryDate.getDate() + DAY_OFFSET[day]);
    const entryDateStr = entryDate.toISOString().split("T")[0];

    await api.post("/api/time-entries", {
      userId,
      weekStart,
      workItemId: projectId,
      entryDate: entryDateStr,
      hours: parsedHours,
      description: "",
    });
  }
}
