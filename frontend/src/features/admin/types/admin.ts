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
  userEmail?: string;
  weekStart: string;
  status: "NOT_SENT" | "SENT" | "APPROVED" | "REJECTED";
  totalHours: number;
  managerComment?: string | null;
  employeeComment?: string;

  timeEntries: {
    timeEntryId: number;
    projectId: number | null;
    projectName: string | null;
    workItemId: number | null;
    workItemName: string | null;
    entryDate: string;
    hours: number;
    description?: string | null;
  }[];

  absences: {
    id: number;
    absenceDate: string;
    type: "VACATION" | "SICKNESS" | "LEAVE" | "OTHER";
    hours: number;
    description?: string;
  }[];
};

export type AdminDecisionRequest = {
  userId: number;
  weekStart: string;
  comment?: string;
};
