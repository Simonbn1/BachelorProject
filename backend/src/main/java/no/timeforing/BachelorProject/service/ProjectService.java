package no.timeforing.BachelorProject.service;

import java.util.List;
import no.timeforing.BachelorProject.domain.Project;
import no.timeforing.BachelorProject.domain.WorkItem;

public interface ProjectService {
  List<Project> listProjects();

  Project createProject(String name);

  WorkItem createWorkItem(Long projectId, String externalId, String title);
}
