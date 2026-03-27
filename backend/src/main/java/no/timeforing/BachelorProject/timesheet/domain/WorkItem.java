package no.timeforing.BachelorProject.timesheet.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import no.timeforing.BachelorProject.project.domain.Project;

@Entity
@Table(name = "work_items", uniqueConstraints = @UniqueConstraint(columnNames = {"external_id"}))
@Getter
@Setter
@NoArgsConstructor
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

  public WorkItem(String externalId, String title, Project project) {
    this.externalId = externalId;
    this.title = title;
    this.project = project;
  }
}
