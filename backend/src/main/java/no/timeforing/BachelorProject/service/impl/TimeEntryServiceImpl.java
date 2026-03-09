package no.timeforing.BachelorProject.service.impl;

import java.time.LocalDate;
import java.util.List;
import no.timeforing.BachelorProject.domain.TimeEntry;
import no.timeforing.BachelorProject.domain.Timesheet;
import no.timeforing.BachelorProject.domain.User;
import no.timeforing.BachelorProject.domain.WorkItem;
import no.timeforing.BachelorProject.domain.enums.TimesheetStatus;
import no.timeforing.BachelorProject.repository.TimeEntryRepository;
import no.timeforing.BachelorProject.repository.TimesheetRepository;
import no.timeforing.BachelorProject.repository.UserRepository;
import no.timeforing.BachelorProject.repository.WorkItemRepository;
import no.timeforing.BachelorProject.service.TimeEntryService;
import org.springframework.stereotype.Service;

@Service
public class TimeEntryServiceImpl implements TimeEntryService {

  private final TimeEntryRepository timeEntryRepository;
  private final TimesheetRepository timesheetRepository;
  private final WorkItemRepository workItemRepository;
  private final UserRepository userRepository;

  public TimeEntryServiceImpl(
      TimeEntryRepository timeEntryRepository,
      TimesheetRepository timesheetRepository,
      WorkItemRepository workItemRepository,
      UserRepository userRepository) {
    this.timeEntryRepository = timeEntryRepository;
    this.timesheetRepository = timesheetRepository;
    this.workItemRepository = workItemRepository;
    this.userRepository = userRepository;
  }

  @Override
  public TimeEntry upsertTimeEntry(
      Long userId,
      LocalDate weekStart,
      Long workItemId,
      LocalDate entryDate,
      double hours,
      String description) {
      if (hours < 0) throw new IllegalArgumentException("Hours cannot be negative.");

      Timesheet ts = timesheetRepository
              .findByUserIdAndWeekStart(userId, weekStart)
              .orElseGet(() -> {
                  User user = userRepository.findById(userId)
                          .orElseThrow(() -> new IllegalArgumentException("User not found." + userId));
                  return timesheetRepository.save(new Timesheet(user, weekStart));
              });

      if (ts.getStatus() == TimesheetStatus.SENT || ts.getStatus() == TimesheetStatus.APPROVED) {
          throw new IllegalArgumentException("Timesheet is sent/approved and cannot be edited");
      }

    WorkItem workItem =
        workItemRepository
            .findById(workItemId)
            .orElseThrow(() -> new IllegalArgumentException("WorkItem not found: " + workItemId));

    return timeEntryRepository
        .findByTimesheetIdAndWorkItemIdAndEntryDate(ts.getId(), workItemId, entryDate)
        .map(
            existing -> {
              existing.setHours(hours);
              existing.setDescription(description);
              return timeEntryRepository.save(existing);
            })
        .orElseGet(
            () ->
                timeEntryRepository.save(
                    new TimeEntry(ts, workItem, entryDate, hours, description)));
  }

  @Override
  public List<TimeEntry> listEntries(Long userId, LocalDate weekStart) {
    Timesheet ts =
        timesheetRepository
            .findByUserIdAndWeekStart(userId, weekStart)
            .orElseThrow(() -> new IllegalArgumentException("Timesheet not found for user/week"));
    return timeEntryRepository.findByTimesheetId(ts.getId());
  }
}
