package no.timeforing.BachelorProject.timesheet.api;

import no.timeforing.BachelorProject.timesheet.domain.Timesheet;
import no.timeforing.BachelorProject.timesheet.dto.SubmitTimesheetRequest;
import no.timeforing.BachelorProject.timesheet.application.TimesheetService;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import no.timeforing.BachelorProject.timesheet.application.impl.TimesheetExportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/timesheets")
public class TimesheetController {

    private final TimesheetService timesheetService;

    private final TimesheetExportService exportService;

    public TimesheetController(TimesheetService timesheetService,
                               TimesheetExportService exportService) {
        this.timesheetService = timesheetService;
        this.exportService = exportService;
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

    @GetMapping("/export/excel")
    public ResponseEntity<byte[]> exportExcel(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart,
            JwtAuthenticationToken auth
    ) {
        Long userId = Long.valueOf(auth.getToken().getSubject());
        byte[] data = exportService.exportExcel(userId, weekStart);

        String filename = "timesheet-" + weekStart + ".xlsx";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(data);
    }

    @GetMapping("/export/invoice-basis")
    public ResponseEntity<byte[]> exportInvoiceBasis(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart,
            JwtAuthenticationToken auth
    ) {
        Long userId = Long.valueOf(auth.getToken().getSubject());
        byte[] data = exportService.exportInvoiceBasisExcel(userId, weekStart);

        String filename = "fakturagrunnlag-" + weekStart + ".xlsx";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(data);
    }
}
