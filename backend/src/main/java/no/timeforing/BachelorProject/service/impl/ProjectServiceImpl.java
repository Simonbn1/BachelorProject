package no.timeforing.BachelorProject.service.impl;

import no.timeforing.BachelorProject.domain.Project;
import no.timeforing.BachelorProject.repository.ProjectRepository;
import no.timeforing.BachelorProject.service.ProjectService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectServiceImpl(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    @Override
    public List<Project> listProjects() {
        return projectRepository.findAll();
    }

    @Override
    public Project createProject(String name) {
        if (name == null || name.isBlank()) throw new IllegalArgumentException("Project name is required");
        return projectRepository.save(new Project(name));
    }
}