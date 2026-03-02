package no.timeforing.BachelorProject.controller;

import no.timeforing.BachelorProject.domain.Timesheet;
import no.timeforing.BachelorProject.dto.SubmitTimesheetRequest;
import no.timeforing.BachelorProject.service.TimesheetService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/timesheets")
public class TimesheetController {

  private final TimesheetService timesheetService;

  public TimesheetController(TimesheetService timesheetService) {
    this.timesheetService = timesheetService;
  }

  @PostMapping("/submit")
  public Timesheet submit(@RequestBody SubmitTimesheetRequest req) {
    return timesheetService.submitTimesheet(req.userId, req.weekStart);
  }
}
