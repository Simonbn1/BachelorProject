package no.timeforing.BachelorProject.absence.repository;

import java.util.List;
import no.timeforing.BachelorProject.absence.domain.Absence;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AbsenceRepository extends JpaRepository<Absence, Long> {
  List<Absence> findByTimesheetId(Long timesheetId);
}
