package no.timeforing.BachelorProject.project.application;

import java.util.List;
import no.timeforing.BachelorProject.project.domain.Project;
import no.timeforing.BachelorProject.timesheet.domain.WorkItem;

public interface ProjectService {
  List<Project> listProjects();

  Project createProject(String name);

  WorkItem createWorkItem(Long projectId, String externalId, String title);
}
