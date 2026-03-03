package no.timeforing.BachelorProject.controller;

import java.util.List;
import no.timeforing.BachelorProject.domain.TimeEntry;
import no.timeforing.BachelorProject.dto.UpsertTimeEntryRequest;
import no.timeforing.BachelorProject.service.TimeEntryService;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/time-entries")
public class TimeEntryController {

    private final TimeEntryService timeEntryService;

    public TimeEntryController(TimeEntryService timeEntryService) {
        this.timeEntryService = timeEntryService;
    }

    @PostMapping
    public TimeEntry upsert(@RequestBody UpsertTimeEntryRequest req, JwtAuthenticationToken auth) {
        Long effectiveUserId = effectiveUserId(req.userId, auth);
        return timeEntryService.upsertTimeEntry(
                effectiveUserId, req.weekStart, req.workItemId, req.entryDate, req.hours, req.description);
    }

    @GetMapping
    public List<TimeEntry> list(
            @RequestParam(required = false) Long userId,
            @RequestParam String weekStart,
            JwtAuthenticationToken auth
    ) {
        Long effectiveUserId = effectiveUserId(userId, auth);
        return timeEntryService.listEntries(effectiveUserId, java.time.LocalDate.parse(weekStart));
    }

    private Long effectiveUserId(Long requestedUserId, JwtAuthenticationToken auth) {
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin && requestedUserId != null) {
            return requestedUserId;
        }
        return Long.valueOf(auth.getToken().getSubject());
    }
}
