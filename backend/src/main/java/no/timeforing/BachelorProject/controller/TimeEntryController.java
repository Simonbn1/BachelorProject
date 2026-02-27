package no.timeforing.BachelorProject.controller;

import no.timeforing.BachelorProject.domain.TimeEntry;
import no.timeforing.BachelorProject.dto.UpsertTimeEntryRequest;
import no.timeforing.BachelorProject.service.TimeEntryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/time-entries")
public class TimeEntryController {

    private final TimeEntryService timeEntryService;

    public TimeEntryController(TimeEntryService timeEntryService) {
        this.timeEntryService = timeEntryService;
    }

    @PostMapping
    public TimeEntry upsert(@RequestBody UpsertTimeEntryRequest req) {
        return timeEntryService.upsertTimeEntry(req.userId, req.weekStart, req.workItemId, req.entryDate, req.hours, req.description);
    }

    @GetMapping
    public List<TimeEntry> list(@RequestParam Long userId, @RequestParam String weekStart) {
        return timeEntryService.listEntries(userId, java.time.LocalDate.parse(weekStart));
    }
}