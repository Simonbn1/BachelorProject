package no.timeforing.BachelorProject.project.repository;

import no.timeforing.BachelorProject.project.domain.Project;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, Long> {}
