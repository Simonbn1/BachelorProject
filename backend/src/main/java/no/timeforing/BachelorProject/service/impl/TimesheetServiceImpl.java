package no.timeforing.BachelorProject.service.impl;

import java.time.LocalDate;
import no.timeforing.BachelorProject.domain.Timesheet;
import no.timeforing.BachelorProject.domain.User;
import no.timeforing.BachelorProject.domain.enums.TimesheetStatus;
import no.timeforing.BachelorProject.repository.TimesheetRepository;
import no.timeforing.BachelorProject.repository.UserRepository;
import no.timeforing.BachelorProject.service.TimesheetService;
import org.springframework.stereotype.Service;

@Service
public class TimesheetServiceImpl implements TimesheetService {

  private final TimesheetRepository timesheetRepository;
  private final UserRepository userRepository;

  public TimesheetServiceImpl(
      TimesheetRepository timesheetRepository, UserRepository userRepository) {
    this.timesheetRepository = timesheetRepository;
    this.userRepository = userRepository;
  }

  @Override
  public Timesheet getOrCreateTimesheet(Long userId, LocalDate weekStart) {
    return timesheetRepository
        .findByUserIdAndWeekStart(userId, weekStart)
        .orElseGet(
            () -> {
              User user =
                  userRepository
                      .findById(userId)
                      .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
              return timesheetRepository.save(new Timesheet(user, weekStart));
            });
  }

  @Override
  public Timesheet submitTimesheet(Long userId, LocalDate weekStart) {
    Timesheet ts = getOrCreateTimesheet(userId, weekStart);
    if (ts.getStatus() == TimesheetStatus.APPROVED) {
      throw new IllegalStateException("Timesheet already approved and locked.");
    }
    ts.setStatus(TimesheetStatus.SENT);
    return timesheetRepository.save(ts);
  }
}
