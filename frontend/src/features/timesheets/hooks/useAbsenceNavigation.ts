import { useNavigate } from "react-router-dom";
import type { ProjectWithWorkItem } from "./useTimesheet.ts";

type UseAbsenceNavigationProps = {
  visibleProjects: ProjectWithWorkItem[];
  excludedFromAbsence: Record<string, boolean>;
  startDate: Date;
  getNumericValue: (workItemId: number, day: string) => number;
  setShowAbsencePrompt: React.Dispatch<React.SetStateAction<boolean>>;
};

export function useAbsenceNavigation({
  visibleProjects,
  excludedFromAbsence,
  startDate,
  getNumericValue,
  setShowAbsencePrompt,
}: UseAbsenceNavigationProps) {
  const navigate = useNavigate();

  function buildAbsencePayload() {
    const days = ["mon", "tue", "wed", "thu", "fri"];
    const today = new Date();
    const dayIndexMap: Record<string, number> = {
      mon: 0,
      tue: 1,
      wed: 2,
      thu: 3,
      fri: 4,
    };

    const result: {
      projectId: number;
      workItemId: number;
      workItemTitle: string;
      projectName: string;
      missingHours: Record<string, number>;
    }[] = [];

    for (const day of days) {
      const dayDate = new Date(startDate);
      dayDate.setDate(startDate.getDate() + dayIndexMap[day]);
      if (dayDate > today) continue;

      const totalWorked = visibleProjects.reduce(
        (sum, project) => sum + getNumericValue(project.workItemId, day),
        0,
      );

      if (totalWorked >= 7.5) continue;

      const missing = parseFloat((7.5 - totalWorked).toFixed(1));

      const responsibleProject = visibleProjects.find(
        (p) => !excludedFromAbsence[`${p.workItemId}-${day}`],
      );

      if (!responsibleProject) continue;

      const existing = result.find(
        (r) => r.workItemId === responsibleProject.workItemId,
      );

      if (existing) {
        existing.missingHours[day] = missing;
      } else {
        result.push({
          projectId: responsibleProject.id,
          workItemId: responsibleProject.workItemId,
          workItemTitle: responsibleProject.workItemTitle ?? "",
          projectName: responsibleProject.name,
          missingHours: { [day]: missing },
        });
      }
    }
    return result;
  }
  function navigateToAbsence() {
    const days = ["mon", "tue", "wed", "thu", "fri"];
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const dayIndexMap: Record<string, number> = {
      mon: 0,
      tue: 1,
      wed: 2,
      thu: 3,
      fri: 4,
    };
    const dayLabels: Record<string, string> = {
      mon: "Mandag",
      tue: "Tirsdag",
      wed: "Onsdag",
      thu: "Torsdag",
      fri: "Fredag",
    };

    const conflictingDays: string[] = [];
    for (const day of days) {
      const dayDate = new Date(startDate);
      dayDate.setDate(startDate.getDate() + dayIndexMap[day]);
      if (dayDate > today) continue;

      const totalWorked = visibleProjects.reduce(
        (sum, project) => sum + getNumericValue(project.workItemId, day),
        0,
      );

      if (totalWorked >= 7.5) continue;

      const eligbleProjects = visibleProjects.filter(
        (p) => !excludedFromAbsence[`${p.workItemId}-${day}`],
      );
      if (eligbleProjects.length > 1) {
        conflictingDays.push(day);
      }
    }

    if (conflictingDays.length > 0) {
      const conflictNames = conflictingDays.map((d) => dayLabels[d]).join(", ");
      alert(
        `Flere prosjekter konkurrerer om fravær for: ${conflictNames}.\n\nHøyreklikk på dagen du ikke vil registrere fravær for å eksludere den.`,
      );
      setShowAbsencePrompt(true);
      return;
    }

    const payload = buildAbsencePayload();
    sessionStorage.setItem("absencePayload", JSON.stringify(payload));
    navigate("/absence");
  }

  return {
    navigateToAbsence,
    buildAbsencePayload,
  };
}
