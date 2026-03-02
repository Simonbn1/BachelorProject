package no.timeforing.BachelorProject.controller;

import no.timeforing.BachelorProject.domain.Timesheet;
import no.timeforing.BachelorProject.dto.DecisionTimesheetRequest;
import no.timeforing.BachelorProject.service.ApprovalService;
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
