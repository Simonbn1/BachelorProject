package no.timeforing.BachelorProject.repository;

import no.timeforing.BachelorProject.domain.WorkItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkItemRepository extends JpaRepository<WorkItem, Long> {}
