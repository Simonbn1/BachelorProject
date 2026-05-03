package no.timeforing.BachelorProject.absence.api;

import java.util.List;

import no.timeforing.BachelorProject.absence.domain.Absence;
import no.timeforing.BachelorProject.absence.dto.MyAbsenceResponse;
import no.timeforing.BachelorProject.absence.dto.UpsertAbsenceRequest;
import no.timeforing.BachelorProject.absence.application.AbsenceService;
import no.timeforing.BachelorProject.absence.repository.AbsenceRepository;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/absences")
public class AbsenceController {

    private final AbsenceService absenceService;
    private final AbsenceRepository absenceRepository;

    public AbsenceController(
            AbsenceService absenceService,
            AbsenceRepository absenceRepository
    ) {
        this.absenceService = absenceService;
        this.absenceRepository = absenceRepository;
    }

    @PostMapping
    public Absence upsert(@RequestBody UpsertAbsenceRequest req, JwtAuthenticationToken auth) {
        Long effectiveUserId = effectiveUserId(req.userId, auth);
        return absenceService.upsertAbsence(
                effectiveUserId,
                req.weekStart,
                req.absenceDate,
                req.type,
                req.description,
                req.hours,
                req.projectId,
                req.workItemId
        );
    }

    @GetMapping
    public List<Absence> list(
            @RequestParam(required = false) Long userId,
            @RequestParam String weekStart,
            JwtAuthenticationToken auth
    ) {
        Long effectiveUserId = effectiveUserId(userId, auth);
        return absenceService.listAbsences(
                effectiveUserId,
                java.time.LocalDate.parse(weekStart)
        );
    }

    @GetMapping("/me")
    public List<MyAbsenceResponse> getMyAbsences(JwtAuthenticationToken auth) {
        Long userId = Long.valueOf(auth.getToken().getSubject());

        return absenceRepository
                .findByTimesheetUserIdOrderByAbsenceDateDesc(userId)
                .stream()
                .map(absence -> new MyAbsenceResponse(
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

    private Long effectiveUserId(Long requestedUserId, JwtAuthenticationToken auth) {
        boolean isAdmin = auth.getAuthorities()
                .stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (isAdmin && requestedUserId != null) {
            return requestedUserId;
        }

        return Long.valueOf(auth.getToken().getSubject());
    }
}