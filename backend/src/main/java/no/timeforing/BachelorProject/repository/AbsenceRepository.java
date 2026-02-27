package no.timeforing.BachelorProject.repository;

import no.timeforing.BachelorProject.domain.Absence;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AbsenceRepository extends JpaRepository<Absence, Long> {
    List<Absence> findByTimesheetId(Long timesheetId);
}