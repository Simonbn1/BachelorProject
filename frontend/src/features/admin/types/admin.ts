export type AdminTimesheetSummary = {
  timesheetId: number;
  userId: number;
  userName: string;
  userEmail?: string;
  status: "NOT_SENT" | "SENT" | "APPROVED" | "REJECTED";
  totalHours: number;
  hasAbsence: boolean;
};

export type AdminTimesheetDetail = {
  timesheetId: number;
  userId: number;
  userName: string;
  weekStart: string;
  status: "NOT_SENT" | "SENT" | "APPROVED" | "REJECTED";
  totalHours: number;
  managerComment?: string;
  employeeComment?: string;
  entries: {
    id: number;
    entryDate: string;
    projectName: string;
    workItemTitle?: string;
    hours: number;
    description?: string;
  }[];
  absences: {
    id: number;
    absenceDate: string;
    type: "VACATION" | "SICKNESS" | "PERMISSION" | "OTHER";
    hours: number;
    description?: string;
  }[];
};

export type AdminDecisionRequest = {
  managerComment?: string;
};
