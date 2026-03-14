package no.timeforing.BachelorProject.timesheet.repository;

import no.timeforing.BachelorProject.timesheet.domain.WorkItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkItemRepository extends JpaRepository<WorkItem, Long> {}
