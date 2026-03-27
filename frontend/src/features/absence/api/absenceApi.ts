import { api } from "../../../shared/api/client.ts";

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMonday(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDay() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return formatDate(d);
}

export async function saveAbsences(
  userId: number,
  absenceType: string,
  description: string,
  projectId: number,
  startDate: Date,
  endDate: Date,
) {
  const cur = new Date(startDate);
  const end = new Date(endDate);

  while (cur <= end) {
    const dayOfWeek = cur.getDay();

    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      const weekStart = getMonday(cur);
      const absenceDateStr = formatDate(cur);

      await api.post("api/absences", {
        userId,
        weekStart,
        absenceDate: absenceDateStr,
        type: absenceType,
        description,
        hours: 7.5,
        projectId,
      });
    }

    cur.setDate(cur.getDate() + 1);
  }
}
