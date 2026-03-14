package no.timeforing.BachelorProject.timesheet.dto;

import java.time.LocalDate;

public class DecisionTimesheetRequest {
  public Long userId;
  public LocalDate weekStart;
  public String comment; // ved avvisning
}
