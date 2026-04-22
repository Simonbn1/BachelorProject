export type MyTimesheet = {
  timesheetId: number;
  weekStart: string;
  status: "NOT_SENT" | "SENT" | "APPROVED" | "REJECTED";
  totalHours: number;
  hasAbsence: boolean;
  managerComment?: string | null;
};

export type SubmitTimesheetRequest = {
  weekStart: string;
  userId?: number;
};
