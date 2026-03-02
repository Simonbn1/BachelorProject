package no.timeforing.BachelorProject.controller;

import java.util.List;
import no.timeforing.BachelorProject.domain.Absence;
import no.timeforing.BachelorProject.dto.UpsertAbsenceRequest;
import no.timeforing.BachelorProject.service.AbsenceService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/absences")
public class AbsenceController {

  private final AbsenceService absenceService;

  public AbsenceController(AbsenceService absenceService) {
    this.absenceService = absenceService;
  }

  @PostMapping
  public Absence upsert(@RequestBody UpsertAbsenceRequest req) {
    return absenceService.upsertAbsence(
        req.userId, req.weekStart, req.absenceDate, req.type, req.hours);
  }

  @GetMapping
  public List<Absence> list(@RequestParam Long userId, @RequestParam String weekStart) {
    return absenceService.listAbsences(userId, java.time.LocalDate.parse(weekStart));
  }
}
