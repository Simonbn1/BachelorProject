package no.timeforing.BachelorProject.service;

import java.time.LocalDate;
import no.timeforing.BachelorProject.domain.Timesheet;

public interface ApprovalService {
  Timesheet approve(Long userId, LocalDate weekStart);

  Timesheet reject(Long userId, LocalDate weekStart, String comment);
}
