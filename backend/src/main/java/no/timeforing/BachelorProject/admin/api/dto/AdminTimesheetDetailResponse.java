package no.timeforing.BachelorProject.admin.api.dto;

import java.time.LocalDate;
import java.util.List;

public record AdminTimesheetDetailResponse(
        Long timesheetId,
        Long userId,
        String userName,
        String userEmail,
        LocalDate weekStart,
        String status,
        String managerComment,
        double totalHours,
        List<AdminTimeEntryResponse> timeEntries,
        List<AdminAbsenceResponse> absences
) {
}