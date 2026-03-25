package no.timeforing.BachelorProject.timesheet.application;

import java.time.LocalDate;
import java.util.List;
import no.timeforing.BachelorProject.timesheet.domain.TimeEntry;

public interface TimeEntryService {
  TimeEntry upsertTimeEntry(
      Long userId,
      LocalDate weekStart,
      Long projectId,
      LocalDate entryDate,
      double hours,
      String description);

  List<TimeEntry> listEntries(Long userId, LocalDate weekStart);
}
