package no.timeforing.BachelorProject.timesheet.dto;

import java.time.LocalDate;

public record MyTimesheetResponse(
        Long timesheetId,
        LocalDate weekStart,
        String status,
        double totalHours,
        boolean hasAbsence,
        String managerComment
) {}