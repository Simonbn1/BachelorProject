package no.timeforing.BachelorProject.admin.api;

import no.timeforing.BachelorProject.timesheet.application.impl.TimesheetExportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/export")
public class AdminExportController {

    private final TimesheetExportService exportService;

    public AdminExportController(TimesheetExportService exportService) {
        this.exportService = exportService;
    }

    @GetMapping("/invoice-basis")
    public ResponseEntity<byte[]> exportInvoiceBasis(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart
    ) {
        byte[] data = exportService.exportAdminInvoiceBasisExcel(weekStart);

        String filename = "fakturagrunnlag-" + weekStart + ".xlsx";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(data);
    }
}