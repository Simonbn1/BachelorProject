package no.timeforing.BachelorProject.timesheet.application.impl;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import no.timeforing.BachelorProject.timesheet.domain.TimeEntry;
import no.timeforing.BachelorProject.timesheet.domain.Timesheet;
import no.timeforing.BachelorProject.timesheet.repository.TimeEntryRepository;
import no.timeforing.BachelorProject.timesheet.repository.TimesheetRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

@Service
public class TimesheetExportService {

    private final TimesheetRepository timesheetRepository;
    private final TimeEntryRepository timeEntryRepository;

    public TimesheetExportService(
            TimesheetRepository timesheetRepository,
            TimeEntryRepository timeEntryRepository
    ) {
        this.timesheetRepository = timesheetRepository;
        this.timeEntryRepository = timeEntryRepository;
    }

    public byte[] exportExcel(Long userId, LocalDate weekStart) {
        Timesheet ts = getTimesheet(userId, weekStart);
        List<TimeEntry> entries = getSortedEntries(ts);

        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Timeliste");

            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dateStyle = createDateStyle(workbook);
            CellStyle textStyle = createTextStyle(workbook);
            CellStyle numberStyle = createNumberStyle(workbook);
            CellStyle totalStyle = createTotalStyle(workbook);

            int rowIdx = 0;

            Row titleRow = sheet.createRow(rowIdx++);
            titleRow.createCell(0).setCellValue("Timeliste");
            titleRow.createCell(1).setCellValue("Uke startet: " + weekStart);

            rowIdx++;

            Row headerRow = sheet.createRow(rowIdx++);
            String[] headers = {
                    "Dato", "Timer", "Overtid", "Beskrivelse",
                    "WorkItemId", "WorkItemNavn", "Prosjekt"
            };

            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            double totalHours = 0.0;
            double totalOvertime = 0.0;

            for (TimeEntry entry : entries) {
                Row row = sheet.createRow(rowIdx++);

                createCell(row, 0, entry.getEntryDate().toString(), dateStyle);
                createCell(row, 1, entry.getHours(), numberStyle);
                createCell(row, 2, entry.getOvertimeHours(), numberStyle);
                createCell(row, 3, safe(entry.getDescription()), textStyle);
                createCell(row, 4, entry.getWorkItem().getId(), textStyle);
                createCell(row, 5, safe(entry.getWorkItem().getTitle()), textStyle);
                createCell(row, 6, safe(entry.getWorkItem().getProject().getName()), textStyle);

                totalHours += entry.getHours();
                totalOvertime += entry.getOvertimeHours();
            }

            Row totalRow = sheet.createRow(rowIdx);
            createCell(totalRow, 0, "Totalt", totalStyle);
            createCell(totalRow, 1, totalHours, totalStyle);
            createCell(totalRow, 2, totalOvertime, totalStyle);

            autosize(sheet, headers.length);

            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Kunne ikke generere Excel-fil", e);
        }
    }

    public byte[] exportInvoiceBasisExcel(Long userId, LocalDate weekStart) {
        Timesheet ts = getTimesheet(userId, weekStart);
        List<TimeEntry> entries = getSortedEntries(ts);

        Map<String, InvoiceLine> grouped = new LinkedHashMap<>();

        for (TimeEntry entry : entries) {
            String projectName = safe(entry.getWorkItem().getProject().getName());
            String workItemTitle = safe(entry.getWorkItem().getTitle());
            String key = projectName + "||" + workItemTitle;

            grouped.computeIfAbsent(
                    key,
                    k -> new InvoiceLine(
                            projectName,
                            entry.getWorkItem().getId(),
                            workItemTitle
                    )
            ).addHours(entry.getHours(), entry.getOvertimeHours());
        }

        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Fakturagrunnlag");

            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle textStyle = createTextStyle(workbook);
            CellStyle numberStyle = createNumberStyle(workbook);
            CellStyle totalStyle = createTotalStyle(workbook);

            int rowIdx = 0;

            Row titleRow = sheet.createRow(rowIdx++);
            titleRow.createCell(0).setCellValue("Fakturagrunnlag");
            titleRow.createCell(1).setCellValue("Uke startet: " + weekStart);

            rowIdx++;

            Row headerRow = sheet.createRow(rowIdx++);
            String[] headers = {
                    "Prosjekt", "WorkItemId", "WorkItemNavn", "Timer", "Overtid"
            };

            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            double totalHours = 0.0;
            double totalOvertime = 0.0;

            for (InvoiceLine line : grouped.values()) {
                Row row = sheet.createRow(rowIdx++);

                createCell(row, 0, line.projectName(), textStyle);
                createCell(row, 1, line.workItemId(), textStyle);
                createCell(row, 2, line.workItemTitle(), textStyle);
                createCell(row, 3, line.hours(), numberStyle);
                createCell(row, 4, line.overtimeHours(), numberStyle);

                totalHours += line.hours();
                totalOvertime += line.overtimeHours();
            }

            Row totalRow = sheet.createRow(rowIdx);
            createCell(totalRow, 0, "Totalt", totalStyle);
            createCell(totalRow, 3, totalHours, totalStyle);
            createCell(totalRow, 4, totalOvertime, totalStyle);

            autosize(sheet, headers.length);

            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Kunne ikke generere fakturagrunnlag", e);
        }
    }

    private Timesheet getTimesheet(Long userId, LocalDate weekStart) {
        return timesheetRepository
                .findByUserIdAndWeekStart(userId, weekStart)
                .orElseThrow(() -> new RuntimeException("Timesheet not found"));
    }

    private List<TimeEntry> getSortedEntries(Timesheet ts) {
        List<TimeEntry> entries = timeEntryRepository.findByTimesheetId(ts.getId());
        entries.sort(
                Comparator.comparing(TimeEntry::getEntryDate)
                        .thenComparing(e -> e.getWorkItem().getId())
        );
        return entries;
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

    private void createCell(Row row, int col, String value, CellStyle style) {
        Cell cell = row.createCell(col);
        cell.setCellValue(value);
        cell.setCellStyle(style);
    }

    private void createCell(Row row, int col, double value, CellStyle style) {
        Cell cell = row.createCell(col);
        cell.setCellValue(value);
        cell.setCellStyle(style);
    }

    private void createCell(Row row, int col, Long value, CellStyle style) {
        Cell cell = row.createCell(col);
        cell.setCellValue(value == null ? "" : String.valueOf(value));
        cell.setCellStyle(style);
    }

    private void autosize(Sheet sheet, int columnCount) {
        for (int i = 0; i < columnCount; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        Font font = workbook.createFont();
        font.setBold(true);

        CellStyle style = workbook.createCellStyle();
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    private CellStyle createTextStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    private CellStyle createDateStyle(Workbook workbook) {
        return createTextStyle(workbook);
    }

    private CellStyle createNumberStyle(Workbook workbook) {
        CellStyle style = createTextStyle(workbook);
        DataFormat format = workbook.createDataFormat();
        style.setDataFormat(format.getFormat("0.0"));
        return style;
    }

    private CellStyle createTotalStyle(Workbook workbook) {
        Font font = workbook.createFont();
        font.setBold(true);

        CellStyle style = createNumberStyle(workbook);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.LEMON_CHIFFON.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return style;
    }

    private static final class InvoiceLine {
        private final String projectName;
        private final Long workItemId;
        private final String workItemTitle;
        private double hours;
        private double overtimeHours;

        private InvoiceLine(String projectName, Long workItemId, String workItemTitle) {
            this.projectName = projectName;
            this.workItemId = workItemId;
            this.workItemTitle = workItemTitle;
        }

        void addHours(double hours, double overtimeHours) {
            this.hours += hours;
            this.overtimeHours += overtimeHours;
        }

        String projectName() {
            return projectName;
        }

        Long workItemId() {
            return workItemId;
        }

        String workItemTitle() {
            return workItemTitle;
        }

        double hours() {
            return hours;
        }

        double overtimeHours() {
            return overtimeHours;
        }
    }
}