import { api } from "../../../shared/api/client.ts";
import axios from "axios";

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMonday(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return formatDate(d);
}

async function postAbsence(
  userId: number,
  absenceType: string,
  description: string,
  projectId: number,
  weekStart: string,
  absenceDateStr: string,
  hours: number,
) {
  try {
    await api.post("api/absences", {
      userId,
      weekStart,
      absenceDate: absenceDateStr,
      type: absenceType,
      description,
      hours,
      projectId,
    });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 500) {
      throw new Error(
        `Kan ikke registrere fravær for ${absenceDateStr}: brukeren har allerede registrert timer denne dagen.`,
      );
    }
    throw error;
  }
}

const DAY_OFFSETS: Record<string, number> = {
  mon: 0,
  tue: 1,
  wed: 2,
  thu: 3,
  fri: 4,
};

export async function saveAbsences(
  userId: number,
  absenceType: string,
  description: string,
  projectId: number,
  startDate: Date | null,
  endDate: Date | null,
  hours: Record<string, string>,
  isRangeBased: boolean,
) {
  if (isRangeBased && startDate && endDate) {
    const cur = new Date(startDate);
    const end = new Date(endDate);

    while (cur <= end) {
      if (cur.getDay() >= 1 && cur.getDay() <= 5) {
        await postAbsence(
          userId,
          absenceType,
          description,
          projectId,
          getMonday(cur),
          formatDate(cur),
          7.5,
        );
      }
      cur.setDate(cur.getDate() + 1);
    }
  } else {
    for (const [day, hoursStr] of Object.entries(hours)) {
      const parsedHours = parseFloat(hoursStr.replace(",", "."));
      if (!parsedHours || parsedHours <= 0) continue;

      const weekStart = getMonday(new Date());
      const absenceDate = new Date(weekStart);
      absenceDate.setDate(absenceDate.getDate() + DAY_OFFSETS[day]);

      await postAbsence(
        userId,
        absenceType,
        description,
        projectId,
        weekStart,
        formatDate(absenceDate),
        parsedHours,
      );
    }
  }
}
