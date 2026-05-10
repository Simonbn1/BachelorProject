package no.timeforing.BachelorProject.admin.service;

import no.timeforing.BachelorProject.absence.domain.Absence;
import no.timeforing.BachelorProject.absence.repository.AbsenceRepository;
import no.timeforing.BachelorProject.admin.api.dto.AdminAbsenceResponse;
import no.timeforing.BachelorProject.admin.api.dto.AdminTimeEntryResponse;
import no.timeforing.BachelorProject.admin.api.dto.AdminTimesheetDetailResponse;
import no.timeforing.BachelorProject.admin.api.dto.AdminTimesheetSummaryResponse;
import no.timeforing.BachelorProject.timesheet.domain.TimeEntry;
import no.timeforing.BachelorProject.timesheet.domain.Timesheet;
import no.timeforing.BachelorProject.timesheet.domain.enums.TimesheetStatus;
import no.timeforing.BachelorProject.timesheet.repository.TimeEntryRepository;
import no.timeforing.BachelorProject.timesheet.repository.TimesheetRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class AdminTimesheetService {

    private final TimesheetRepository timesheetRepository;
    private final TimeEntryRepository timeEntryRepository;
    private final AbsenceRepository absenceRepository;

    public AdminTimesheetService(
            TimesheetRepository timesheetRepository,
            TimeEntryRepository timeEntryRepository,
            AbsenceRepository absenceRepository
    ) {
        this.timesheetRepository = timesheetRepository;
        this.timeEntryRepository = timeEntryRepository;
        this.absenceRepository = absenceRepository;
    }

    public List<AdminTimesheetSummaryResponse> getTimesheetsForWeek(LocalDate weekStart) {
        List<TimesheetStatus> visibleStatuses = List.of(
                TimesheetStatus.SENT,
                TimesheetStatus.APPROVED,
                TimesheetStatus.REJECTED
        );

        List<Timesheet> timesheets = timesheetRepository.findAllByWeekStartAndStatusIn(
                weekStart,
                visibleStatuses
        );

        return timesheets.stream()
                .map(timesheet -> {
                    List<TimeEntry> entries = timeEntryRepository.findAllByTimesheetId(timesheet.getId());
                    List<Absence> absences = absenceRepository.findByTimesheetId(timesheet.getId());

                    double totalHours = Math.round(
                            entries.stream()
                                    .mapToDouble(TimeEntry::getHours)
                                    .sum() * 10.0
                    ) / 10.0;

                    boolean hasSicknessEntries = entries.stream()
                            .anyMatch(this::isSicknessProject);

                    boolean hasAbsence = !absences.isEmpty() || hasSicknessEntries;

                    return new AdminTimesheetSummaryResponse(
                            timesheet.getId(),
                            timesheet.getUser().getId(),
                            timesheet.getUser().getDisplayName(),
                            timesheet.getUser().getEmail(),
                            timesheet.getStatus().name(),
                            totalHours,
                            hasAbsence
                    );
                })
                .toList();
    }

    public AdminTimesheetDetailResponse getTimesheetDetails(Long timesheetId) {
        Timesheet timesheet = timesheetRepository.findById(timesheetId)
                .orElseThrow(() -> new IllegalArgumentException("Timesheet not found: " + timesheetId));

        List<TimeEntry> entries = timeEntryRepository.findAllByTimesheetId(timesheetId);
        List<Absence> absences = absenceRepository.findByTimesheetId(timesheetId);

        List<AdminTimeEntryResponse> timeEntryResponses = entries.stream()
                .map(entry -> new AdminTimeEntryResponse(
                        entry.getId(),
                        entry.getWorkItem() != null && entry.getWorkItem().getProject() != null
                                ? entry.getWorkItem().getProject().getId()
                                : null,
                        entry.getWorkItem() != null && entry.getWorkItem().getProject() != null
                                ? entry.getWorkItem().getProject().getName()
                                : null,
                        entry.getWorkItem() != null ? entry.getWorkItem().getId() : null,
                        entry.getWorkItem() != null ? entry.getWorkItem().getTitle() : null,
                        entry.getEntryDate(),
                        entry.getHours(),
                        entry.getDescription()
                ))
                .toList();

        List<AdminAbsenceResponse> absenceResponses = absences.stream()
                .map(absence -> new AdminAbsenceResponse(
                        absence.getId(),
                        absence.getAbsenceDate(),
                        absence.getType().name(),
                        absence.getHours(),
                        absence.getDescription(),
                        absence.getStatus().name(),
                        absence.getManagerComment()
                ))
                .toList();

        double totalHours = Math.round(
                entries.stream()
                        .mapToDouble(TimeEntry::getHours)
                        .sum() * 10.0
        ) / 10.0;

        return new AdminTimesheetDetailResponse(
                timesheet.getId(),
                timesheet.getUser().getId(),
                timesheet.getUser().getDisplayName(),
                timesheet.getUser().getEmail(),
                timesheet.getWeekStart(),
                timesheet.getStatus().name(),
                timesheet.getManagerComment(),
                totalHours,
                timeEntryResponses,
                absenceResponses
        );
    }

    private boolean isSicknessProject(TimeEntry entry) {
        if (entry.getWorkItem() == null || entry.getWorkItem().getProject() == null) {
            return false;
        }

        String projectName = entry.getWorkItem().getProject().getName();

        return projectName != null && projectName.equalsIgnoreCase("Sykdom");
    }
}