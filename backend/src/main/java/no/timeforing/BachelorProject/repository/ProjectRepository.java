package no.timeforing.BachelorProject.repository;

import no.timeforing.BachelorProject.domain.Project;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, Long> {}