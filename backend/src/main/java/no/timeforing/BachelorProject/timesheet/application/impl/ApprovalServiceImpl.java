package no.timeforing.BachelorProject.timesheet.application.impl;

import java.time.LocalDate;
import no.timeforing.BachelorProject.timesheet.domain.Timesheet;
import no.timeforing.BachelorProject.timesheet.domain.enums.TimesheetStatus;
import no.timeforing.BachelorProject.timesheet.repository.TimesheetRepository;
import no.timeforing.BachelorProject.timesheet.application.ApprovalService;
import org.springframework.stereotype.Service;

@Service
public class ApprovalServiceImpl implements ApprovalService {

  private final TimesheetRepository timesheetRepository;

  public ApprovalServiceImpl(TimesheetRepository timesheetRepository) {
    this.timesheetRepository = timesheetRepository;
  }

  @Override
  public Timesheet approve(Long userId, LocalDate weekStart) {
    Timesheet ts =
        timesheetRepository
            .findByUserIdAndWeekStart(userId, weekStart)
            .orElseThrow(() -> new IllegalArgumentException("Timesheet not found for user/week"));
    ts.setStatus(TimesheetStatus.APPROVED);
    ts.setManagerComment(null);
    return timesheetRepository.save(ts);
  }

  @Override
  public Timesheet reject(Long userId, LocalDate weekStart, String comment) {
    if (comment == null || comment.isBlank()) {
      throw new IllegalArgumentException("Reject requires a comment.");
    }
    Timesheet ts =
        timesheetRepository
            .findByUserIdAndWeekStart(userId, weekStart)
            .orElseThrow(() -> new IllegalArgumentException("Timesheet not found for user/week"));
    ts.setStatus(TimesheetStatus.REJECTED);
    ts.setManagerComment(comment);
    return timesheetRepository.save(ts);
  }
}
