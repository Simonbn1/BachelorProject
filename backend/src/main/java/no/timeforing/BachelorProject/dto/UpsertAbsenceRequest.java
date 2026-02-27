package no.timeforing.BachelorProject.dto;

import no.timeforing.BachelorProject.domain.enums.AbsenceType;

import java.time.LocalDate;

public class UpsertAbsenceRequest {
    public Long userId;
    public LocalDate weekStart;
    public LocalDate absenceDate;
    public AbsenceType type;
    public double hours;
}