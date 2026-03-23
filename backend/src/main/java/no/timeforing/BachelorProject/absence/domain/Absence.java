package no.timeforing.BachelorProject.absence.domain;

import jakarta.persistence.*;
import java.time.LocalDate;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import no.timeforing.BachelorProject.timesheet.domain.Timesheet;
import no.timeforing.BachelorProject.absence.domain.enums.AbsenceType;
@Getter
@Setter
@NoArgsConstructor
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

  public Absence(Timesheet timesheet, LocalDate absenceDate, AbsenceType type, double hours) {
    this.timesheet = timesheet;
    this.absenceDate = absenceDate;
    this.type = type;
    this.hours = hours;
  }
}
