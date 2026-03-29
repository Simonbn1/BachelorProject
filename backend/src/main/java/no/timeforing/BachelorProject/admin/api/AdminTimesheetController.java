package no.timeforing.BachelorProject.admin.api;

import no.timeforing.BachelorProject.admin.service.AdminTimesheetService;
import no.timeforing.BachelorProject.admin.api.dto.AdminTimesheetSummaryResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/timesheets")
public class AdminTimesheetController {

    private final AdminTimesheetService adminTimesheetService;

    public AdminTimesheetController(AdminTimesheetService adminTimesheetService) {
        this.adminTimesheetService = adminTimesheetService;
    }

    @GetMapping
    public List<AdminTimesheetSummaryResponse> getTimesheets(
            @RequestParam LocalDate weekStart
    ) {
        return adminTimesheetService.getTimesheetsForWeek(weekStart);
    }
}