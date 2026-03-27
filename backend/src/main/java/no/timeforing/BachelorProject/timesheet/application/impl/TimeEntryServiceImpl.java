package no.timeforing.BachelorProject.timesheet.application.impl;

import java.time.LocalDate;
import java.util.List;
import no.timeforing.BachelorProject.timesheet.domain.TimeEntry;
import no.timeforing.BachelorProject.timesheet.domain.Timesheet;
import no.timeforing.BachelorProject.user.domain.User;
import no.timeforing.BachelorProject.timesheet.domain.WorkItem;
import no.timeforing.BachelorProject.timesheet.domain.enums.TimesheetStatus;
import no.timeforing.BachelorProject.timesheet.repository.TimeEntryRepository;
import no.timeforing.BachelorProject.timesheet.repository.TimesheetRepository;
import no.timeforing.BachelorProject.user.repository.UserRepository;
import no.timeforing.BachelorProject.timesheet.repository.WorkItemRepository;
import no.timeforing.BachelorProject.timesheet.application.TimeEntryService;
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
            Long projectId,
            LocalDate entryDate,
            double hours,
            String description) {

        if (hours < 0) {
            throw new IllegalArgumentException("Hours cannot be negative.");
        }

        Timesheet ts = timesheetRepository
                .findByUserIdAndWeekStart(userId, weekStart)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
                    return timesheetRepository.save(new Timesheet(user, weekStart));
                });

        if (ts.getStatus() == TimesheetStatus.SENT || ts.getStatus() == TimesheetStatus.APPROVED) {
            throw new IllegalArgumentException("Timesheet is sent/approved and cannot be edited");
        }

        WorkItem workItem = workItemRepository
                .findFirstByProjectId(projectId)
                .orElseThrow(() -> new IllegalArgumentException("WorkItem not found for project: " + projectId));

        return timeEntryRepository
                .findByTimesheetIdAndWorkItemIdAndEntryDate(ts.getId(), workItem.getId(), entryDate)
                .map(existing -> {
                    existing.setHours(hours);
                    existing.setOvertimeHours(Math.max(0, hours - 7.5));
                    existing.setDescription(description);
                    return timeEntryRepository.save(existing);
                })
                .orElseGet(() ->
                        timeEntryRepository.save(
                                new TimeEntry(ts, workItem, entryDate, hours, description)
                        )
                );
    }

    @Override
    public List<TimeEntry> listEntries(Long userId, LocalDate weekStart) {
        return timesheetRepository
                .findByUserIdAndWeekStart(userId, weekStart)
                .map(ts -> timeEntryRepository.findByTimesheetId(ts.getId()))
                .orElse(List.of());
    }

    @Override
    public void deleteEntries(Long userId, LocalDate weekStart, Long projectId) {
        Timesheet ts = timesheetRepository
                .findByUserIdAndWeekStart(userId, weekStart)
                .orElseThrow(() -> new IllegalArgumentException("Timesheet not found for user/week"));

        WorkItem workItem = workItemRepository
                .findFirstByProjectId(projectId)
                .orElseThrow(() -> new IllegalArgumentException("WorkItem not found for project: " + projectId));

        List<TimeEntry> entries = timeEntryRepository.findByTimesheetIdAndWorkItemId(ts.getId(), workItem.getId());
        timeEntryRepository.deleteAll(entries);
    }
}