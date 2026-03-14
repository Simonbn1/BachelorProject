package no.timeforing.BachelorProject.timesheet.domain;

import jakarta.persistence.*;
import java.time.LocalDate;
import no.timeforing.BachelorProject.timesheet.domain.enums.TimesheetStatus;
import no.timeforing.BachelorProject.user.domain.User;

@Entity
@Table(
    name = "timesheets",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "weekStart"}))
public class Timesheet {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(optional = false)
  private User user;

  // Mandag i valgt uke
  @Column(nullable = false)
  private LocalDate weekStart;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private TimesheetStatus status = TimesheetStatus.NOT_SENT;

  // ved avvisning
  private String managerComment;

  public Timesheet() {}

  public Timesheet(User user, LocalDate weekStart) {
    this.user = user;
    this.weekStart = weekStart;
  }

  public Long getId() {
    return id;
  }

  public User getUser() {
    return user;
  }

  public LocalDate getWeekStart() {
    return weekStart;
  }

  public TimesheetStatus getStatus() {
    return status;
  }

  public void setStatus(TimesheetStatus status) {
    this.status = status;
  }

  public String getManagerComment() {
    return managerComment;
  }

  public void setManagerComment(String managerComment) {
    this.managerComment = managerComment;
  }
}
