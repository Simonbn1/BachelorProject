package no.timeforing.BachelorProject.timesheet.application;

import java.time.LocalDate;
import no.timeforing.BachelorProject.timesheet.domain.Timesheet;

public interface ApprovalService {
  Timesheet approve(Long userId, LocalDate weekStart);

  Timesheet reject(Long userId, LocalDate weekStart, String comment);
}
