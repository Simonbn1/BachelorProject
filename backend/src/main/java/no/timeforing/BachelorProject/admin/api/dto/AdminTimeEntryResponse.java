package no.timeforing.BachelorProject.admin.api.dto;

import java.time.LocalDate;

public record AdminTimeEntryResponse(
        Long timeEntryId,
        Long projectId,
        String projectName,
        Long workItemId,
        String workItemName,
        LocalDate entryDate,
        double hours,
        String description
) {
}