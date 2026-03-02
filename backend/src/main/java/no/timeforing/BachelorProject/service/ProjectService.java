package no.timeforing.BachelorProject.service;

import java.util.List;
import no.timeforing.BachelorProject.domain.Project;

public interface ProjectService {
  List<Project> listProjects();

  Project createProject(String name);
}
