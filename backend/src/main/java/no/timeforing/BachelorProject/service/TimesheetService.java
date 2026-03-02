package no.timeforing.BachelorProject.service;

import java.time.LocalDate;
import no.timeforing.BachelorProject.domain.Timesheet;

public interface TimesheetService {
  Timesheet getOrCreateTimesheet(Long userId, LocalDate weekStart);

  Timesheet submitTimesheet(Long userId, LocalDate weekStart);
}
