package no.timeforing.BachelorProject.service;

import no.timeforing.BachelorProject.domain.Timesheet;

import java.time.LocalDate;

public interface TimesheetService {
    Timesheet getOrCreateTimesheet(Long userId, LocalDate weekStart);
    Timesheet submitTimesheet(Long userId, LocalDate weekStart);
}