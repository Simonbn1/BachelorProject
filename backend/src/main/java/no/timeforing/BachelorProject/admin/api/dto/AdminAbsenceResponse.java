package no.timeforing.BachelorProject.admin.api.dto;

import java.time.LocalDate;

public record AdminAbsenceResponse(
        Long absenceId,
        LocalDate absenceDate,
        String type,
        double hours,
        String description
) {
}