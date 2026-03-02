package no.timeforing.BachelorProject.service;

import java.time.LocalDate;
import java.util.List;
import no.timeforing.BachelorProject.domain.Absence;
import no.timeforing.BachelorProject.domain.enums.AbsenceType;

public interface AbsenceService {
  Absence upsertAbsence(
      Long userId, LocalDate weekStart, LocalDate absenceDate, AbsenceType type, double hours);

  List<Absence> listAbsences(Long userId, LocalDate weekStart);
}
