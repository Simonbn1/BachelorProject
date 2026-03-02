package no.timeforing.BachelorProject.repository;

import java.util.List;
import no.timeforing.BachelorProject.domain.Absence;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AbsenceRepository extends JpaRepository<Absence, Long> {
  List<Absence> findByTimesheetId(Long timesheetId);
}
