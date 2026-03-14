package no.timeforing.BachelorProject.timesheet.repository;

import java.time.LocalDate;
import java.util.Optional;
import no.timeforing.BachelorProject.timesheet.domain.Timesheet;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TimesheetRepository extends JpaRepository<Timesheet, Long> {
  Optional<Timesheet> findByUserIdAndWeekStart(Long userId, LocalDate weekStart);
}
