package no.timeforing.BachelorProject.service;

import no.timeforing.BachelorProject.domain.Absence;
import no.timeforing.BachelorProject.domain.enums.AbsenceType;

import java.time.LocalDate;
import java.util.List;

public interface AbsenceService {
    Absence upsertAbsence(Long userId, LocalDate weekStart, LocalDate absenceDate, AbsenceType type, double hours);
    List<Absence> listAbsences(Long userId, LocalDate weekStart);
}