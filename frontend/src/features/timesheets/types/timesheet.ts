export type SavedTimesheet = {
  timesheetId: number;
  weekStart: string;
  status: "NOT_SENT" | "SENT" | "APPROVED" | "REJECTED";
  totalHours: number;
  hasAbsence: boolean;
};

export type SubmitTimesheetRequest = {
  weekStart: string;
  userId?: number;
};
