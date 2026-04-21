package no.timeforing.BachelorProject.timesheet.dto;

import java.time.LocalDate;

public record SavedTimesheetResponse(
        Long timesheetId,
        LocalDate weekStart,
        String status,
        double totalHours,
        boolean hasAbsence
) {}