package no.timeforing.BachelorProject.domain;

import jakarta.persistence.*;
import java.time.LocalDate;
import no.timeforing.BachelorProject.domain.enums.AbsenceType;

@Entity
@Table(
    name = "absences",
    uniqueConstraints = @UniqueConstraint(columnNames = {"timesheet_id", "absenceDate", "type"}))
public class Absence {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(optional = false)
  private Timesheet timesheet;

  @Column(nullable = false)
  private LocalDate absenceDate;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private AbsenceType type;

  @Column(nullable = false)
  private double hours;

  public Absence() {}

  public Absence(Timesheet timesheet, LocalDate absenceDate, AbsenceType type, double hours) {
    this.timesheet = timesheet;
    this.absenceDate = absenceDate;
    this.type = type;
    this.hours = hours;
  }

  public Long getId() {
    return id;
  }

  public Timesheet getTimesheet() {
    return timesheet;
  }

  public LocalDate getAbsenceDate() {
    return absenceDate;
  }

  public void setAbsenceDate(LocalDate absenceDate) {
    this.absenceDate = absenceDate;
  }

  public AbsenceType getType() {
    return type;
  }

  public void setType(AbsenceType type) {
    this.type = type;
  }

  public double getHours() {
    return hours;
  }

  public void setHours(double hours) {
    this.hours = hours;
  }
}
