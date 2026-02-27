package no.timeforing.BachelorProject.dto;

import java.time.LocalDate;

public class UpsertTimeEntryRequest {
    public Long userId;
    public LocalDate weekStart;
    public Long workItemId;
    public LocalDate entryDate;
    public double hours;
    public String description;
}