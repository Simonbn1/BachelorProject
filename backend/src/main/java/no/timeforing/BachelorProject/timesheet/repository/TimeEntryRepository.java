package no.timeforing.BachelorProject.timesheet.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import no.timeforing.BachelorProject.timesheet.domain.TimeEntry;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TimeEntryRepository extends JpaRepository<TimeEntry, Long> {
  List<TimeEntry> findByTimesheetId(Long timesheetId);

  Optional<TimeEntry> findByTimesheetIdAndWorkItemIdAndEntryDate(
      Long timesheetId, Long workItemId, LocalDate entryDate);

  List<TimeEntry> findByTimesheetIdAndWorkItemId(Long timesheetId, Long workItemId);
}
