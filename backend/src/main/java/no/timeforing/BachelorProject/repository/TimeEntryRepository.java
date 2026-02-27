package no.timeforing.BachelorProject.repository;

import no.timeforing.BachelorProject.domain.TimeEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TimeEntryRepository extends JpaRepository<TimeEntry, Long> {
    List<TimeEntry> findByTimesheetId(Long timesheetId);
    Optional<TimeEntry> findByTimesheetIdAndWorkItemIdAndEntryDate(Long timesheetId, Long workItemId, LocalDate entryDate);
}