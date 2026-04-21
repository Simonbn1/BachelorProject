package no.timeforing.BachelorProject.timesheet.application.impl;

import java.time.LocalDate;
import java.util.List;

import no.timeforing.BachelorProject.absence.domain.Absence;
import no.timeforing.BachelorProject.absence.repository.AbsenceRepository;
import no.timeforing.BachelorProject.timesheet.domain.TimeEntry;
import no.timeforing.BachelorProject.timesheet.domain.Timesheet;
import no.timeforing.BachelorProject.timesheet.domain.enums.TimesheetStatus;
import no.timeforing.BachelorProject.timesheet.dto.SavedTimesheetResponse;
import no.timeforing.BachelorProject.timesheet.repository.TimeEntryRepository;
import no.timeforing.BachelorProject.timesheet.repository.TimesheetRepository;
import no.timeforing.BachelorProject.user.domain.User;
import no.timeforing.BachelorProject.user.repository.UserRepository;
import no.timeforing.BachelorProject.timesheet.application.TimesheetService;

import org.springframework.stereotype.Service;

@Service
public class TimesheetServiceImpl implements TimesheetService {

    private final TimesheetRepository timesheetRepository;
    private final UserRepository userRepository;
    private final TimeEntryRepository timeEntryRepository;
    private final AbsenceRepository absenceRepository;

    public TimesheetServiceImpl(
            TimesheetRepository timesheetRepository,
            UserRepository userRepository,
            TimeEntryRepository timeEntryRepository,
            AbsenceRepository absenceRepository
    ) {
        this.timesheetRepository = timesheetRepository;
        this.userRepository = userRepository;
        this.timeEntryRepository = timeEntryRepository;
        this.absenceRepository = absenceRepository;
    }

    @Override
    public Timesheet getOrCreateTimesheet(Long userId, LocalDate weekStart) {
        return timesheetRepository
                .findByUserIdAndWeekStart(userId, weekStart)
                .orElseGet(() -> {
                    User user = userRepository
                            .findById(userId)
                            .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

                    Timesheet ts = new Timesheet(user, weekStart);
                    ts.setStatus(TimesheetStatus.NOT_SENT); // 🔥 viktig fix

                    return timesheetRepository.save(ts);
                });
    }

    @Override
    public Timesheet submitTimesheet(Long userId, LocalDate weekStart) {
        Timesheet ts = getOrCreateTimesheet(userId, weekStart);

        if (ts.getStatus() == TimesheetStatus.APPROVED) {
            throw new IllegalStateException("Timesheet already approved and locked.");
        }

        ts.setStatus(TimesheetStatus.SENT);
        return timesheetRepository.save(ts);
    }

    @Override
    public List<SavedTimesheetResponse> getDraftTimesheets(Long userId) {
        List<Timesheet> drafts =
                timesheetRepository.findAllByUserIdAndStatusOrderByWeekStartDesc(
                        userId,
                        TimesheetStatus.NOT_SENT
                );

        return drafts.stream()
                .map(timesheet -> {
                    List<TimeEntry> entries =
                            timeEntryRepository.findAllByTimesheetId(timesheet.getId());

                    List<Absence> absences =
                            absenceRepository.findByTimesheetId(timesheet.getId());

                    double totalHours = Math.round(
                            entries.stream()
                                    .mapToDouble(TimeEntry::getHours)
                                    .sum() * 10.0
                    ) / 10.0;

                    boolean hasAbsence = !absences.isEmpty();

                    return new SavedTimesheetResponse(
                            timesheet.getId(),
                            timesheet.getWeekStart(),
                            timesheet.getStatus().name(),
                            totalHours,
                            hasAbsence
                    );
                })
                .toList();
    }

    @Override
    public void deleteTimesheet(Long userId, Long timesheetId) {
        Timesheet ts = timesheetRepository.findById(timesheetId)
                .orElseThrow(() -> new IllegalArgumentException("Timesheet not found: " + timesheetId));

        if (!ts.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You cannot delete another user's timesheet");
        }

        if (ts.getStatus() != TimesheetStatus.NOT_SENT) {
            throw new IllegalArgumentException("Only NOT_SENT timesheets can be deleted");
        }

        timesheetRepository.delete(ts);
    }
}