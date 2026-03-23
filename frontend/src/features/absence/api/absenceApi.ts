import { api } from "../../../shared/api/client.ts";

const DAY_OFFSETS: Record<string, number> = {
  mon: 0,
  tue: 1,
  wed: 2,
  thu: 3,
  fri: 4,
};

export async function saveAbsences(
  userId: number,
  weekStart: string,
  absenceType: string,
  description: string,
  hours: Record<string, string>,
  projectId: number,
) {
  const days = ["mon", "tue", "wed", "thu", "fri"];

  for (const day of days) {
    const parsedHours = parseFloat((hours[day] ?? "0").replace(",", "."));
    if (parsedHours === 0) continue;

    const absenceDate = new Date(weekStart);
    absenceDate.setDate(absenceDate.getDate() + DAY_OFFSETS[day]);
    const absenceDateStr = absenceDate.toISOString().split("T")[0];

    await api.post("api/absences", {
      userId,
      weekStart,
      absenceDate: absenceDateStr,
      type: absenceType,
      description: description,
      hours: parsedHours,
      projectId,
    });
  }
}
