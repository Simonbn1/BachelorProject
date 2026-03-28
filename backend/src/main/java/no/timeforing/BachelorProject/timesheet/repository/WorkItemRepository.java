package no.timeforing.BachelorProject.timesheet.repository;

import java.util.List;
import no.timeforing.BachelorProject.timesheet.domain.WorkItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkItemRepository extends JpaRepository<WorkItem, Long> {
    List<WorkItem> findByProjectId(Long projectId);
}