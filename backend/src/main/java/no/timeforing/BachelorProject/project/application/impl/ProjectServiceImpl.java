package no.timeforing.BachelorProject.project.application.impl;

import java.util.List;
import no.timeforing.BachelorProject.project.domain.Project;
import no.timeforing.BachelorProject.timesheet.domain.WorkItem;
import no.timeforing.BachelorProject.project.repository.ProjectRepository;
import no.timeforing.BachelorProject.timesheet.repository.WorkItemRepository;
import no.timeforing.BachelorProject.project.application.ProjectService;
import org.springframework.stereotype.Service;

@Service
public class ProjectServiceImpl implements ProjectService {

  private final ProjectRepository projectRepository;
  private final WorkItemRepository workItemRepository;

  public ProjectServiceImpl(ProjectRepository projectRepository, WorkItemRepository workItemRepository) {
      this.projectRepository = projectRepository;
      this.workItemRepository = workItemRepository;
  }

  @Override
  public List<Project> listProjects() {
    return projectRepository.findAll();
  }

  @Override
  public Project createProject(String name) {
    if (name == null || name.isBlank())
      throw new IllegalArgumentException("Project name is required");
    return projectRepository.save(new Project(name));
  }

  @Override
  public WorkItem createWorkItem(Long projectId, String externalId, String title) {
      Project project = projectRepository.findById(projectId)
              .orElseThrow(() -> new IllegalArgumentException("Project not found" + projectId));
      if  (externalId == null || externalId.isBlank())
        throw new IllegalArgumentException("External Id is required");
      return  workItemRepository.save(new WorkItem(externalId, title, project));
  }
}
