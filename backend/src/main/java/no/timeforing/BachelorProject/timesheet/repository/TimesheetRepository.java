package no.timeforing.BachelorProject.timesheet.repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import no.timeforing.BachelorProject.timesheet.domain.Timesheet;
import no.timeforing.BachelorProject.timesheet.domain.enums.TimesheetStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TimesheetRepository extends JpaRepository<Timesheet, Long> {
    Optional<Timesheet> findByUserIdAndWeekStart(Long userId, LocalDate weekStart);

    List<Timesheet> findAllByWeekStart(LocalDate weekStart);

    List<Timesheet> findAllByWeekStartAndStatusIn(
            LocalDate weekStart,
            Collection<TimesheetStatus> statuses
    );

    List<Timesheet> findAllByUserIdAndStatusOrderByWeekStartDesc(
            Long userId,
            TimesheetStatus status
    );
}