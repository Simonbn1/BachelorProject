package no.timeforing.BachelorProject.absence.application;

import java.time.LocalDate;
import java.util.List;
import no.timeforing.BachelorProject.absence.domain.Absence;
import no.timeforing.BachelorProject.absence.domain.enums.AbsenceType;

public interface AbsenceService {
  Absence upsertAbsence(
      Long userId, LocalDate weekStart, LocalDate absenceDate, AbsenceType type, String description,double hours, Long projectId);

  List<Absence> listAbsences(Long userId, LocalDate weekStart);
}
