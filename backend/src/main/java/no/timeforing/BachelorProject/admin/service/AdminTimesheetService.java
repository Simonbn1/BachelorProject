package no.timeforing.BachelorProject.admin.service;

import no.timeforing.BachelorProject.admin.api.dto.AdminTimesheetSummaryResponse;
import no.timeforing.BachelorProject.timesheet.domain.TimeEntry;
import no.timeforing.BachelorProject.timesheet.domain.Timesheet;
import no.timeforing.BachelorProject.timesheet.repository.TimeEntryRepository;
import no.timeforing.BachelorProject.timesheet.repository.TimesheetRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class AdminTimesheetService {

    private final TimesheetRepository timesheetRepository;
    private final TimeEntryRepository timeEntryRepository;

    public AdminTimesheetService(
            TimesheetRepository timesheetRepository,
            TimeEntryRepository timeEntryRepository
    ) {
        this.timesheetRepository = timesheetRepository;
        this.timeEntryRepository = timeEntryRepository;
    }

    public List<AdminTimesheetSummaryResponse> getTimesheetsForWeek(LocalDate weekStart) {
        List<Timesheet> timesheets = timesheetRepository.findAllByWeekStart(weekStart);

        return timesheets.stream()
                .map(timesheet -> {
                    List<TimeEntry> entries = timeEntryRepository.findAllByTimesheetId(timesheet.getId());

                    double totalHours = entries.stream()
                            .mapToDouble(TimeEntry::getHours)
                            .sum();

                    return new AdminTimesheetSummaryResponse(
                            timesheet.getId(),
                            timesheet.getUser().getId(),
                            timesheet.getUser().getDisplayName(),
                            timesheet.getUser().getEmail(),
                            timesheet.getStatus().name(),
                            totalHours,
                            false
                    );
                })
                .toList();
    }
}