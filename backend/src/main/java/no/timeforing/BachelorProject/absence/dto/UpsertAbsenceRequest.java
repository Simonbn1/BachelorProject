package no.timeforing.BachelorProject.absence.dto;

import java.time.LocalDate;
import no.timeforing.BachelorProject.absence.domain.enums.AbsenceType;

public class UpsertAbsenceRequest {
  public Long userId;
  public LocalDate weekStart;
  public LocalDate absenceDate;
  public AbsenceType type;
  public String description;
  public double hours;
  public long projectId;
  public long workItemId;
}
