package no.timeforing.BachelorProject.absence.api;

import java.util.List;
import no.timeforing.BachelorProject.absence.domain.Absence;
import no.timeforing.BachelorProject.absence.dto.UpsertAbsenceRequest;
import no.timeforing.BachelorProject.absence.application.AbsenceService;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/absences")
public class AbsenceController {

    private final AbsenceService absenceService;

    public AbsenceController(AbsenceService absenceService) {
        this.absenceService = absenceService;
    }

    @PostMapping
    public Absence upsert(@RequestBody UpsertAbsenceRequest req, JwtAuthenticationToken auth) {
        Long effectiveUserId = effectiveUserId(req.userId, auth);
        return absenceService.upsertAbsence(
                effectiveUserId, req.weekStart, req.absenceDate, req.type, req.description, req.hours, req.projectId, req.workItemId);
    }

    @GetMapping
    public List<Absence> list(
            @RequestParam(required = false) Long userId,
            @RequestParam String weekStart,
            JwtAuthenticationToken auth
    ) {
        Long effectiveUserId = effectiveUserId(userId, auth);
        return absenceService.listAbsences(effectiveUserId, java.time.LocalDate.parse(weekStart));
    }

    private Long effectiveUserId(Long requestedUserId, JwtAuthenticationToken auth) {
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin && requestedUserId != null) {
            return requestedUserId;
        }
        return Long.valueOf(auth.getToken().getSubject());
    }
}
