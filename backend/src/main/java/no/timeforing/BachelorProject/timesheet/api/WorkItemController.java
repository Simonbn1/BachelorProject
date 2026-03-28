package no.timeforing.BachelorProject.timesheet.api;

import no.timeforing.BachelorProject.timesheet.domain.WorkItem;
import no.timeforing.BachelorProject.timesheet.repository.WorkItemRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/work-items")
public class WorkItemController {

    private final WorkItemRepository workItemRepository;

    public WorkItemController(WorkItemRepository workItemRepository) {
        this.workItemRepository = workItemRepository;
    }

    @GetMapping
    public List<WorkItem> listByProject(@RequestParam Long projectId) {
        return workItemRepository.findByProjectId(projectId);
    }
}
