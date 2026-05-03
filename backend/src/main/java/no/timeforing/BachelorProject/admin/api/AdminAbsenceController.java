package no.timeforing.BachelorProject.admin.api;

import no.timeforing.BachelorProject.absence.domain.Absence;
import no.timeforing.BachelorProject.absence.domain.enums.AbsenceStatus;
import no.timeforing.BachelorProject.absence.repository.AbsenceRepository;
import no.timeforing.BachelorProject.admin.api.dto.AdminAbsenceDecisionRequest;
import no.timeforing.BachelorProject.admin.api.dto.AdminAbsenceResponse;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/absences")
public class AdminAbsenceController {

    private final AbsenceRepository absenceRepository;

    public AdminAbsenceController(AbsenceRepository absenceRepository) {
        this.absenceRepository = absenceRepository;
    }

    @GetMapping
    public List<AdminAbsenceResponse> getAbsences() {
        return absenceRepository.findAll().stream()
                .map(absence -> new AdminAbsenceResponse(
                        absence.getId(),
                        absence.getAbsenceDate(),
                        absence.getType().name(),
                        absence.getHours(),
                        absence.getDescription(),
                        absence.getStatus().name(),
                        absence.getManagerComment()
                ))
                .toList();
    }

    @PostMapping("/{id}/approve")
    public void approve(@PathVariable Long id) {
        Absence absence = absenceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Absence not found"));

        absence.setStatus(AbsenceStatus.APPROVED);
        absence.setManagerComment(null);
        absenceRepository.save(absence);
    }

    @PostMapping("/{id}/reject")
    public void reject(
            @PathVariable Long id,
            @RequestBody AdminAbsenceDecisionRequest request
    ) {
        Absence absence = absenceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Absence not found"));

        absence.setStatus(AbsenceStatus.REJECTED);
        absence.setManagerComment(request.comment());
        absenceRepository.save(absence);
    }
}