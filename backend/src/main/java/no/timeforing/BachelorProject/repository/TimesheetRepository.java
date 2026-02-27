package no.timeforing.BachelorProject.repository;

import no.timeforing.BachelorProject.domain.Timesheet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface TimesheetRepository extends JpaRepository<Timesheet, Long> {
    Optional<Timesheet> findByUserIdAndWeekStart(Long userId, LocalDate weekStart);
}