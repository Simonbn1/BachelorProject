package no.timeforing.BachelorProject.timesheet.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
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

  @Column(nullable = false)
  private double overtimeHours;

  private String description;

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
    this.overtimeHours = Math.max(0, hours - 7.5);
    this.description = description;
  }

}
