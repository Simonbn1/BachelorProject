package no.timeforing.BachelorProject.timesheet.api;

import no.timeforing.BachelorProject.timesheet.domain.Timesheet;
import no.timeforing.BachelorProject.timesheet.dto.DecisionTimesheetRequest;
import no.timeforing.BachelorProject.timesheet.application.ApprovalService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/approvals")
public class ApprovalController {

  private final ApprovalService approvalService;

  public ApprovalController(ApprovalService approvalService) {
    this.approvalService = approvalService;
  }

  @PostMapping("/approve")
  public Timesheet approve(@RequestBody DecisionTimesheetRequest req) {
    return approvalService.approve(req.userId, req.weekStart);
  }

  @PostMapping("/reject")
  public Timesheet reject(@RequestBody DecisionTimesheetRequest req) {
    return approvalService.reject(req.userId, req.weekStart, req.comment);
  }
}
