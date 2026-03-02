package no.timeforing.BachelorProject.controller;

import java.util.List;
import no.timeforing.BachelorProject.domain.Project;
import no.timeforing.BachelorProject.service.ProjectService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

  private final ProjectService projectService;

  public ProjectController(ProjectService projectService) {
    this.projectService = projectService;
  }

  @GetMapping
  public List<Project> list() {
    return projectService.listProjects();
  }

  @PostMapping
  public Project create(@RequestParam String name) {
    return projectService.createProject(name);
  }
}
