package no.timeforing.BachelorProject.timesheet.application;

import java.time.LocalDate;
import java.util.List;
import no.timeforing.BachelorProject.timesheet.domain.Timesheet;
import no.timeforing.BachelorProject.timesheet.dto.SavedTimesheetResponse;

public interface TimesheetService {
    Timesheet getOrCreateTimesheet(Long userId, LocalDate weekStart);

    Timesheet submitTimesheet(Long userId, LocalDate weekStart);

    List<SavedTimesheetResponse> getDraftTimesheets(Long userId);

    void deleteTimesheet(Long userId, Long timesheetId);
}