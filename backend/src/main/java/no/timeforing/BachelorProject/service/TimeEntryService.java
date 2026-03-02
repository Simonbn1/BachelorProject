package no.timeforing.BachelorProject.service;

import java.time.LocalDate;
import java.util.List;
import no.timeforing.BachelorProject.domain.TimeEntry;

public interface TimeEntryService {
  TimeEntry upsertTimeEntry(
      Long userId,
      LocalDate weekStart,
      Long workItemId,
      LocalDate entryDate,
      double hours,
      String description);

  List<TimeEntry> listEntries(Long userId, LocalDate weekStart);
}
