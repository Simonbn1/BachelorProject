package no.timeforing.BachelorProject.absence.dto;

import java.time.LocalDate;

public record MyAbsenceResponse(
        Long id,
        LocalDate absenceDate,
        String type,
        double hours,
        String description,
        String status,
        String managerComment
) {
}