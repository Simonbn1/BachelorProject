package no.timeforing.BachelorProject.dto;

import java.time.LocalDate;
import no.timeforing.BachelorProject.domain.enums.AbsenceType;

public class UpsertAbsenceRequest {
  public Long userId;
  public LocalDate weekStart;
  public LocalDate absenceDate;
  public AbsenceType type;
  public double hours;
}
