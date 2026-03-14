package no.timeforing.BachelorProject.timesheet.application;

import java.time.LocalDate;
import no.timeforing.BachelorProject.timesheet.domain.Timesheet;

public interface TimesheetService {
  Timesheet getOrCreateTimesheet(Long userId, LocalDate weekStart);

  Timesheet submitTimesheet(Long userId, LocalDate weekStart);
}
