package no.timeforing.BachelorProject.timesheet.domain;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(
    name = "time_entries",
    uniqueConstraints =
        @UniqueConstraint(columnNames = {"timesheet_id", "workItem_id", "entryDate"}))
public class TimeEntry {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(optional = false)
  private Timesheet timesheet;

  @ManyToOne(optional = false)
  private WorkItem workItem;

  @Column(nullable = false)
  private LocalDate entryDate;

  @Column(nullable = false)
  private double hours;

  private String description;

  public TimeEntry() {}

  public TimeEntry(
      Timesheet timesheet,
      WorkItem workItem,
      LocalDate entryDate,
      double hours,
      String description) {
    this.timesheet = timesheet;
    this.workItem = workItem;
    this.entryDate = entryDate;
    this.hours = hours;
    this.description = description;
  }

  public Long getId() {
    return id;
  }

  public Timesheet getTimesheet() {
    return timesheet;
  }

  public WorkItem getWorkItem() {
    return workItem;
  }

  public LocalDate getEntryDate() {
    return entryDate;
  }

  public void setEntryDate(LocalDate entryDate) {
    this.entryDate = entryDate;
  }

  public double getHours() {
    return hours;
  }

  public void setHours(double hours) {
    this.hours = hours;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }
}
