package no.timeforing.BachelorProject.service;

import no.timeforing.BachelorProject.domain.Timesheet;

import java.time.LocalDate;

public interface ApprovalService {
    Timesheet approve(Long userId, LocalDate weekStart);
    Timesheet reject(Long userId, LocalDate weekStart, String comment);
}