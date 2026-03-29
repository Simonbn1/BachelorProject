package no.timeforing.BachelorProject.timesheet.repository;

import no.timeforing.BachelorProject.timesheet.domain.TimeEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TimeEntryRepository extends JpaRepository<TimeEntry, Long> {

    Optional<TimeEntry> findByTimesheetIdAndWorkItemIdAndEntryDate(
            Long timesheetId,
            Long workItemId,
            LocalDate entryDate
    );

    List<TimeEntry> findByTimesheetId(Long timesheetId);

    List<TimeEntry> findAllByTimesheetId(Long timesheetId);

    List<TimeEntry> findByTimesheetIdAndWorkItemId(Long timesheetId, Long workItemId);

    List<TimeEntry> findByTimesheet_UserIdAndEntryDate(Long userId, LocalDate entryDate);
}