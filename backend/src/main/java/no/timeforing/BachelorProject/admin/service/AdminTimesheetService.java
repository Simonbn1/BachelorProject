package no.timeforing.BachelorProject.admin.service;

import no.timeforing.BachelorProject.admin.api.dto.AdminTimesheetSummaryResponse;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class AdminTimesheetService {

    public List<AdminTimesheetSummaryResponse> getTimesheetsForWeek(LocalDate weekStart) {
        return List.of();
    }
}