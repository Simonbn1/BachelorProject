package no.timeforing.BachelorProject.service;

import no.timeforing.BachelorProject.domain.Project;

import java.util.List;

public interface ProjectService {
    List<Project> listProjects();
    Project createProject(String name);
}