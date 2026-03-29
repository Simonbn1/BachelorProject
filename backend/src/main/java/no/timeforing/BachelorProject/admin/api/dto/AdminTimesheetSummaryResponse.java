package no.timeforing.BachelorProject.admin.api.dto;

public record AdminTimesheetSummaryResponse(
        Long timesheetId,
        Long userId,
        String userName,
        String userEmail,
        String status,
        double totalHours,
        boolean hasAbsence
) {
}