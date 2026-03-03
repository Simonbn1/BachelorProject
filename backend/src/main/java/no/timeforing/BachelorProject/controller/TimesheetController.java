package no.timeforing.BachelorProject.controller;

import no.timeforing.BachelorProject.domain.Timesheet;
import no.timeforing.BachelorProject.dto.SubmitTimesheetRequest;
import no.timeforing.BachelorProject.service.TimesheetService;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/timesheets")
public class TimesheetController {

    private final TimesheetService timesheetService;

    public TimesheetController(TimesheetService timesheetService) {
        this.timesheetService = timesheetService;
    }

    @PostMapping("/submit")
    public Timesheet submit(@RequestBody SubmitTimesheetRequest req, JwtAuthenticationToken auth) {
        Long effectiveUserId = effectiveUserId(req.userId, auth);
        return timesheetService.submitTimesheet(effectiveUserId, req.weekStart);
    }

    private Long effectiveUserId(Long requestedUserId, JwtAuthenticationToken auth) {
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin && requestedUserId != null) {
            return requestedUserId;
        }
        return Long.valueOf(auth.getToken().getSubject());
    }
}
