package no.timeforing.BachelorProject.timesheet.domain;

import jakarta.persistence.*;
import no.timeforing.BachelorProject.project.domain.Project;

@Entity
@Table(name = "work_items")
public class WorkItem {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  // f.eks. DevOps ID / Ticketnr
  @Column(nullable = false)
  private String externalId;

  private String title;

  @ManyToOne(optional = false)
  private Project project;

  public WorkItem() {}

  public WorkItem(String externalId, String title, Project project) {
    this.externalId = externalId;
    this.title = title;
    this.project = project;
  }

  public Long getId() {
    return id;
  }

  public String getExternalId() {
    return externalId;
  }

  public void setExternalId(String externalId) {
    this.externalId = externalId;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public Project getProject() {
    return project;
  }

  public void setProject(Project project) {
    this.project = project;
  }
}
