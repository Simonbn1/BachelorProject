package no.timeforing.BachelorProject.absence.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import no.timeforing.BachelorProject.absence.domain.Absence;
import no.timeforing.BachelorProject.absence.domain.enums.AbsenceType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AbsenceRepository extends JpaRepository<Absence, Long> {
  List<Absence> findByTimesheetId(Long timesheetId);

  Optional<Absence> findByTimesheetIdAndAbsenceDateAndType(
          Long timesheetId, LocalDate absenceDate, AbsenceType absenceType);

    List<Absence> findByTimesheetUserIdOrderByAbsenceDateDesc(Long userId);
}
