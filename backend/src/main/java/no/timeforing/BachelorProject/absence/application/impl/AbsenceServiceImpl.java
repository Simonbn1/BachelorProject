package no.timeforing.BachelorProject.absence.application.impl;

import java.time.LocalDate;
import java.util.List;
import no.timeforing.BachelorProject.absence.domain.Absence;
import no.timeforing.BachelorProject.timesheet.domain.Timesheet;
import no.timeforing.BachelorProject.absence.domain.enums.AbsenceType;
import no.timeforing.BachelorProject.timesheet.domain.enums.TimesheetStatus;
import no.timeforing.BachelorProject.absence.repository.AbsenceRepository;
import no.timeforing.BachelorProject.timesheet.repository.TimeEntryRepository;
import no.timeforing.BachelorProject.timesheet.repository.TimesheetRepository;
import no.timeforing.BachelorProject.absence.application.AbsenceService;
import no.timeforing.BachelorProject.user.domain.User;
import no.timeforing.BachelorProject.user.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class AbsenceServiceImpl implements AbsenceService {

  private final AbsenceRepository absenceRepository;
  private final TimesheetRepository timesheetRepository;
  private final UserRepository userRepository;
  private final TimeEntryRepository timeEntryRepository;

  public AbsenceServiceImpl(
      AbsenceRepository absenceRepository, TimesheetRepository timesheetRepository, UserRepository userRepository,  TimeEntryRepository timeEntryRepository) {
    this.absenceRepository = absenceRepository;
    this.timesheetRepository = timesheetRepository;
    this.userRepository = userRepository;
    this.timeEntryRepository = timeEntryRepository;
  }

  private Timesheet findOrCreateTimesheet(Long userId, LocalDate weekStart) {
      return timesheetRepository
            .findByUserIdAndWeekStart(userId, weekStart)
            .orElseGet(() -> {
                User user = userRepository.findById(userId)
                     .orElseThrow(() -> new IllegalArgumentException("No user found with id: " + userId));
                Timesheet newTs = new Timesheet(user, weekStart);
                return timesheetRepository.save(newTs);
            });

  }

  @Override
  public Absence upsertAbsence(
      Long userId, LocalDate weekStart, LocalDate absenceDate, AbsenceType type, String description, double hours, Long projectId) {
    if (hours < 0) throw new IllegalArgumentException("Hours cannot be negative.");

    Timesheet ts = findOrCreateTimesheet(userId, weekStart);

    if (ts.getStatus() == TimesheetStatus.SENT || ts.getStatus() == TimesheetStatus.APPROVED) {
      throw new IllegalStateException("Timesheet is sent/approved and cannot be edited.");
    }

    double existingHours = timeEntryRepository
            .findByTimesheet_UserIdAndEntryDate(userId, absenceDate)
            .stream()
            .mapToDouble(no.timeforing.BachelorProject.timesheet.domain.TimeEntry::getHours)
            .sum();

    if (existingHours > 0) {
        throw new IllegalStateException(
                "Bruker har allerede registrert " + existingHours + " timer for " + absenceDate + ". Kan ikke registrer fravær."
        );
    }

    Absence absence = absenceRepository
            .findByTimesheetIdAndAbsenceDateAndType(ts.getId(), absenceDate, type)
            .orElse(new Absence(ts, absenceDate, type, description, hours, projectId));

    absence.setHours(hours);
    absence.setDescription(description);
    absence.setProjectId(projectId);

    return absenceRepository.save(absence);
  }

  @Override
  public List<Absence> listAbsences(Long userId, LocalDate weekStart) {
      Timesheet ts = findOrCreateTimesheet(userId, weekStart);
      return absenceRepository.findByTimesheetId(ts.getId());
  }
}
