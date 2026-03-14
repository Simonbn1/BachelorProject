package no.timeforing.BachelorProject.absence.application.impl;

import java.time.LocalDate;
import java.util.List;
import no.timeforing.BachelorProject.absence.domain.Absence;
import no.timeforing.BachelorProject.timesheet.domain.Timesheet;
import no.timeforing.BachelorProject.absence.domain.enums.AbsenceType;
import no.timeforing.BachelorProject.timesheet.domain.enums.TimesheetStatus;
import no.timeforing.BachelorProject.absence.repository.AbsenceRepository;
import no.timeforing.BachelorProject.timesheet.repository.TimesheetRepository;
import no.timeforing.BachelorProject.absence.application.AbsenceService;
import org.springframework.stereotype.Service;

@Service
public class AbsenceServiceImpl implements AbsenceService {

  private final AbsenceRepository absenceRepository;
  private final TimesheetRepository timesheetRepository;

  public AbsenceServiceImpl(
      AbsenceRepository absenceRepository, TimesheetRepository timesheetRepository) {
    this.absenceRepository = absenceRepository;
    this.timesheetRepository = timesheetRepository;
  }

  @Override
  public Absence upsertAbsence(
      Long userId, LocalDate weekStart, LocalDate absenceDate, AbsenceType type, double hours) {
    if (hours < 0) throw new IllegalArgumentException("Hours cannot be negative.");

    Timesheet ts =
        timesheetRepository
            .findByUserIdAndWeekStart(userId, weekStart)
            .orElseThrow(() -> new IllegalArgumentException("Timesheet not found for user/week"));

    if (ts.getStatus() == TimesheetStatus.SENT || ts.getStatus() == TimesheetStatus.APPROVED) {
      throw new IllegalStateException("Timesheet is sent/approved and cannot be edited.");
    }

    // enkel versjon: alltid opprett ny
    // (kan senere forbedres til "per day + type" upsert)
    Absence absence = new Absence(ts, absenceDate, type, hours);
    return absenceRepository.save(absence);
  }

  @Override
  public List<Absence> listAbsences(Long userId, LocalDate weekStart) {
    Timesheet ts =
        timesheetRepository
            .findByUserIdAndWeekStart(userId, weekStart)
            .orElseThrow(() -> new IllegalArgumentException("Timesheet not found for user/week"));
    return absenceRepository.findByTimesheetId(ts.getId());
  }
}
