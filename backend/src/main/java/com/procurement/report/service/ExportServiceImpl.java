package com.procurement.report.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.ColumnText;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfPageEventHelper;
import com.lowagie.text.pdf.PdfWriter;
import com.procurement.report.dto.response.ReportExportResponse;
import com.procurement.report.dto.response.ReportRowResponse;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

/**
 * Report exports with a consistent, professional letterhead: the EPS logo,
 * the company name and a proper data table. Used by every "Export PDF/Excel"
 * button across the dashboards.
 */
@Service
public class ExportServiceImpl implements ExportService {

    // ---- Branding ----
    private static final String COMPANY_NAME = "Enterprise Procurement System";
    private static final String COMPANY_TAGLINE = "Procurement \u00b7 Approval \u00b7 Fulfilment \u00b7 Finance";
    private static final String COMPANY_FOOTER = "Enterprise Procurement System \u2014 Confidential";
    private static final String LOGO_RESOURCE = "/static/eps-logo.png";

    private static final Color NAVY = new Color(0x1E, 0x29, 0x3B);
    private static final Color GOLD = new Color(0xD9, 0x77, 0x06);
    private static final Color GOLD_LIGHT = new Color(0xF8, 0xB4, 0x00);
    private static final Color ZEBRA = new Color(0xF8, 0xFA, 0xFC);
    private static final Color BORDER = new Color(0xE2, 0xE8, 0xF0);
    private static final Color TEXT = new Color(0x0F, 0x17, 0x2A);
    private static final Color MUTED = new Color(0x64, 0x74, 0x8B);
    private static final Color WHITE = Color.WHITE;

    // ---- Humanized report titles + column labels per report type ----
    private static final Map<String, String> REPORT_TITLES = Map.ofEntries(
            Map.entry("purchase-requests", "Purchase Requests"),
            Map.entry("approvals", "Approval Tasks"),
            Map.entry("rfqs", "RFQs"),
            Map.entry("quotations", "Vendor Quotations"),
            Map.entry("comparisons", "Quotation Comparisons"),
            Map.entry("purchase-orders", "Purchase Orders"),
            Map.entry("grns", "Goods Receipt Notes"),
            Map.entry("inventory", "Inventory"),
            Map.entry("invoices", "Invoices"),
            Map.entry("three-way-matches", "Three-Way Matches"),
            Map.entry("payments", "Payments"),
            Map.entry("vendors", "Vendors"),
            Map.entry("departments", "Departments"),
            Map.entry("audit-summary", "Audit Summary"));

    private static final Map<String, String[]> REPORT_HEADERS = Map.ofEntries(
            Map.entry("purchase-requests", new String[]{"ID", "Reference", "Purpose", "Status", "Requester", "Department", "Cost Center", "Request Date", "Qty", "Amount", "Remarks"}),
            Map.entry("approvals", new String[]{"ID", "Task No.", "Comments", "Status", "Assignee", "Approver Role", "Request No.", "Assigned Date", "Qty", "Approved Amt", "Comments"}),
            Map.entry("rfqs", new String[]{"ID", "RFQ No.", "Remarks", "Status", "Department", "Request No.", "\u2014", "Issue Date", "Qty", "Amount", "Remarks"}),
            Map.entry("quotations", new String[]{"ID", "Quotation No.", "Remarks", "Status", "Vendor", "RFQ No.", "\u2014", "Submission Date", "Qty", "Grand Total", "Remarks"}),
            Map.entry("comparisons", new String[]{"ID", "Comparison No.", "Remarks", "Status", "RFQ No.", "Method", "\u2014", "Comparison Date", "Qty", "Amount", "Remarks"}),
            Map.entry("purchase-orders", new String[]{"ID", "PO No.", "Remarks", "Status", "Vendor", "Department", "Request No.", "Order Date", "Qty", "Grand Total", "Remarks"}),
            Map.entry("grns", new String[]{"ID", "GRN No.", "Remarks", "Status", "Vendor", "Warehouse", "PO No.", "Receipt Date", "Qty", "Amount", "Remarks"}),
            Map.entry("inventory", new String[]{"ID", "Product Code", "Product", "Status", "Warehouse", "Category", "\u2014", "Last Update", "Avail. Qty", "Inventory Value", "\u2014"}),
            Map.entry("invoices", new String[]{"ID", "Invoice No.", "Remarks", "Status", "Vendor", "PO No.", "GRN No.", "Invoice Date", "Qty", "Grand Total", "Remarks"}),
            Map.entry("three-way-matches", new String[]{"ID", "Match No.", "Remarks", "Status", "Vendor", "PO No.", "GRN No.", "Match Date", "Qty", "Amount", "Result"}),
            Map.entry("payments", new String[]{"ID", "Payment No.", "Remarks", "Status", "Vendor", "Invoice No.", "PO No.", "Payment Date", "Qty", "Net Amount", "Method"}),
            Map.entry("vendors", new String[]{"ID", "Vendor Code", "Type", "Status", "Vendor", "\u2014", "\u2014", "Created", "Qty", "Total Spend", "Approved"}),
            Map.entry("departments", new String[]{"ID", "Dept Code", "Department", "Status", "Name", "\u2014", "\u2014", "Created", "Qty", "Spend", "Description"}),
            Map.entry("audit-summary", new String[]{"\u2014", "Module", "Operation", "Result", "Entity", "Performed By", "Reference", "Date", "Count", "\u2014", "Notes"}));

    private static final DateTimeFormatter GENERATED_AT =
            DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    private ReportExportResponse response(String type, String ext, String contentType, byte[] bytes) {
        return new ReportExportResponse(type + "." + ext, contentType, Base64.getEncoder().encodeToString(bytes));
    }

    // ============================ CSV ============================

    public ReportExportResponse csv(String reportType, List<ReportRowResponse> rows) {
        var sb = new StringBuilder("id,referenceNumber,title,status,relatedOne,relatedTwo,relatedThree,date,quantity,amount,remarks\n");
        for (var r : rows) {
            sb.append(v(r.id())).append(',').append(v(r.referenceNumber())).append(',').append(v(r.title())).append(',').append(v(r.status())).append(',').append(v(r.relatedOne())).append(',').append(v(r.relatedTwo())).append(',').append(v(r.relatedThree())).append(',').append(v(r.date())).append(',').append(v(r.quantity())).append(',').append(v(r.amount())).append(',').append(v(r.remarks())).append('\n');
        }
        return response(reportType, "csv", "text/csv", sb.toString().getBytes(StandardCharsets.UTF_8));
    }

    // ============================ EXCEL ============================

    public ReportExportResponse excel(String reportType, List<ReportRowResponse> rows) {
        try (var wb = new XSSFWorkbook(); var out = new ByteArrayOutputStream()) {
            var sheet = wb.createSheet(titleOf(reportType));
            String[] headers = headersOf(reportType);

            // Title row (branded)
            var titleRow = sheet.createRow(0);
            var titleCell = titleRow.createCell(0);
            titleCell.setCellValue(COMPANY_NAME + " \u2014 " + titleOf(reportType) + " Report");
            var titleStyle = wb.createCellStyle();
            var titleFont = wb.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 14);
            titleFont.setColor(IndexedColors.DARK_BLUE.getIndex());
            titleStyle.setFont(titleFont);
            titleCell.setCellStyle(titleStyle);

            var metaRow = sheet.createRow(1);
            var metaCell = metaRow.createCell(0);
            metaCell.setCellValue("Generated: " + LocalDateTime.now().format(GENERATED_AT) + " \u00b7 Records: " + rows.size());
            var metaStyle = wb.createCellStyle();
            metaStyle.setFont(wb.createFont());
            metaCell.setCellStyle(metaStyle);

            // Header row (styled)
            var headerRow = sheet.createRow(3);
            var headerStyle = wb.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            var headerFont = wb.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            for (int i = 0; i < headers.length; i++) {
                var cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data rows (zebra striped)
            int rowIdx = 4;
            for (var r : rows) {
                org.apache.poi.ss.usermodel.Row row = sheet.createRow(rowIdx++);
                Object[] vals = {r.id(), r.referenceNumber(), r.title(), r.status(), r.relatedOne(), r.relatedTwo(), r.relatedThree(), r.date(), r.quantity(), r.amount(), r.remarks()};
                for (int i = 0; i < vals.length; i++) {
                    var cell = row.createCell(i);
                    if (i == 9 && vals[i] != null) {
                        cell.setCellValue("₹ " + formatINR((BigDecimal) vals[i]));
                    } else {
                        cell.setCellValue(vals[i] == null ? "" : vals[i].toString());
                    }
                    if (rowIdx % 2 == 0) {
                        var zebra = wb.createCellStyle();
                        zebra.setFillForegroundColor(IndexedColors.PALE_BLUE.getIndex());
                        zebra.setFillPattern(FillPatternType.SOLID_FOREGROUND);
                        cell.setCellStyle(zebra);
                    }
                }
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            sheet.createFreezePane(0, 4);

            wb.write(out);
            return response(reportType, "xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", out.toByteArray());
        } catch (Exception e) {
            throw new IllegalStateException("Failed to export Excel report", e);
        }
    }

    // ============================ PDF ============================

    public ReportExportResponse pdf(String reportType, List<ReportRowResponse> rows) {
        try (var out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4.rotate(), 30, 30, 56, 56);
            PdfWriter writer = PdfWriter.getInstance(document, out);
            writer.setPageEvent(new EpsFooter());
            document.open();

            addLetterhead(document, reportType);
            addMeta(document, reportType, rows.size());
            document.add(buildTable(reportType, rows));

            document.close();
            return response(reportType, "pdf", "application/pdf", out.toByteArray());
        } catch (Exception e) {
            throw new IllegalStateException("Failed to export PDF report", e);
        }
    }

    /** Company letterhead: logo + ERP name band + report title. */
    private void addLetterhead(Document document, String reportType) {
        PdfPTable header = new PdfPTable(2);
        header.setWidthPercentage(100);
        header.setWidths(new float[]{72, 640});
        header.getDefaultCell().setBorder(Rectangle.NO_BORDER);

        // Logo cell
        PdfPCell logoCell = new PdfPCell();
        logoCell.setBorder(Rectangle.NO_BORDER);
        logoCell.setPadding(0);
        logoCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        try (var in = ExportServiceImpl.class.getResourceAsStream(LOGO_RESOURCE)) {
            if (in != null) {
                byte[] logoBytes = in.readAllBytes();
                Image logo = Image.getInstance(logoBytes);
                logo.scaleToFit(52, 52);
                logoCell.addElement(logo);
            } else {
                logoCell.addElement(new Paragraph("EPS", new Font(Font.HELVETICA, 20, Font.BOLD, GOLD)));
            }
        } catch (Exception ignored) {
            logoCell.addElement(new Paragraph("EPS", new Font(Font.HELVETICA, 20, Font.BOLD, GOLD)));
        }
        header.addCell(logoCell);

        // Company + title block
        PdfPCell textCell = new PdfPCell();
        textCell.setBorder(Rectangle.NO_BORDER);
        textCell.setPadding(0);
        Paragraph company = new Paragraph(COMPANY_NAME, new Font(Font.HELVETICA, 17, Font.BOLD, NAVY));
        company.setSpacingAfter(2);
        textCell.addElement(company);
        Paragraph tagline = new Paragraph(COMPANY_TAGLINE, new Font(Font.HELVETICA, 9, Font.NORMAL, MUTED));
        tagline.setSpacingAfter(6);
        textCell.addElement(tagline);
        header.addCell(textCell);

        // Gold band with the report title (full-width second row)
        PdfPCell band = new PdfPCell(new Phrase(
                new Chunk(titleOf(reportType) + " Report",
                        new Font(Font.HELVETICA, 11, Font.BOLD, WHITE))));
        band.setBorder(Rectangle.NO_BORDER);
        band.setBackgroundColor(GOLD);
        band.setPadding(7);
        band.setHorizontalAlignment(Element.ALIGN_LEFT);
        band.setColspan(2);
        header.addCell(band);

        document.add(header);

        // Thin navy rule under the letterhead
        PdfPTable rule = new PdfPTable(1);
        rule.setWidthPercentage(100);
        PdfPCell line = new PdfPCell(new Phrase(" "));
        line.setBorder(Rectangle.NO_BORDER);
        line.setBorderWidthBottom(2f);
        line.setBorderColorBottom(NAVY);
        line.setPadding(0);
        line.setFixedHeight(3f);
        rule.addCell(line);
        document.add(rule);
    }

    /** Generated-by / date / record count summary line. */
    private void addMeta(Document document, String reportType, int count) {
        Paragraph meta = new Paragraph(
                "Generated on " + LocalDateTime.now().format(GENERATED_AT)
                        + "   \u00b7   " + count + " record(s)",
                new Font(Font.HELVETICA, 8.5f, Font.NORMAL, MUTED));
        meta.setSpacingBefore(10);
        meta.setSpacingAfter(4);
        document.add(meta);
    }

    /** Branded data table with repeating header, zebra rows and INR amounts. */
    private PdfPTable buildTable(String reportType, List<ReportRowResponse> rows) {
        String[] headers = headersOf(reportType);
        PdfPTable table = new PdfPTable(headers.length);
        table.setWidthPercentage(100);
        table.setHeaderRows(1);
        table.setSplitLate(false);
        table.setWidths(widthsFor(headers.length));

        // Header row
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, new Font(Font.HELVETICA, 8, Font.BOLD, WHITE)));
            cell.setBackgroundColor(NAVY);
            cell.setPadding(5);
            cell.setBorderColor(BORDER);
            cell.setHorizontalAlignment(Element.ALIGN_LEFT);
            table.addCell(cell);
        }

        if (rows.isEmpty()) {
            PdfPCell empty = new PdfPCell(new Phrase("No records found for this report.",
                    new Font(Font.HELVETICA, 9, Font.NORMAL, MUTED)));
            empty.setColspan(headers.length);
            empty.setPadding(10);
            empty.setBorderColor(BORDER);
            empty.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(empty);
            return table;
        }

        int idx = 0;
        for (var r : rows) {
            Object[] vals = {r.id(), r.referenceNumber(), r.title(), r.status(),
                    r.relatedOne(), r.relatedTwo(), r.relatedThree(), r.date(),
                    r.quantity(), r.amount(), r.remarks()};
            for (int i = 0; i < vals.length; i++) {
                String text = textOf(vals[i], i);
                PdfPCell cell = new PdfPCell(new Phrase(text, new Font(Font.HELVETICA, 8, Font.NORMAL, TEXT)));
                cell.setPadding(4);
                cell.setBorderColor(BORDER);
                if (i == 9) {
                    cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                } else if (i == 8) {
                    cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                } else {
                    cell.setHorizontalAlignment(Element.ALIGN_LEFT);
                }
                if (idx % 2 == 1) {
                    cell.setBackgroundColor(ZEBRA);
                }
                table.addCell(cell);
            }
            idx++;
        }
        return table;
    }

    private String textOf(Object value, int columnIndex) {
        if (value == null) return "";
        if (columnIndex == 9 && value instanceof BigDecimal amount) {
            return "₹ " + formatINR(amount);
        }
        return String.valueOf(value);
    }

    private float[] widthsFor(int columns) {
        float[] wide = {30f, 72f, 100f, 54f, 66f, 66f, 66f, 62f, 40f, 74f, 96f};
        if (columns == 11) return wide;
        float[] out = new float[columns];
        for (int i = 0; i < columns; i++) out[i] = wide[Math.min(i, wide.length - 1)];
        return out;
    }

    private String titleOf(String reportType) {
        return REPORT_TITLES.getOrDefault(reportType,
                reportType.replace('-', ' ').replaceAll("(^|\\s)([a-z])", "$1" + "$2".toUpperCase()));
    }

    private String[] headersOf(String reportType) {
        return REPORT_HEADERS.getOrDefault(reportType, new String[]{
                "ID", "Reference", "Title", "Status", "Related 1", "Related 2", "Related 3",
                "Date", "Quantity", "Amount", "Remarks"});
    }

    /** Indian Rupee grouping: 1,23,456.78 (rightmost 3 digits, then groups of 2). */
    private String formatINR(BigDecimal value) {
        if (value == null) return "0.00";
        boolean negative = value.signum() < 0;
        BigDecimal abs = value.abs().setScale(2, java.math.RoundingMode.HALF_UP);
        long rupees = abs.longValue();
        long paise = abs.subtract(BigDecimal.valueOf(rupees)).movePointRight(2).longValueExact();

        String whole = Long.toString(rupees);
        StringBuilder grouped = new StringBuilder();
        int len = whole.length();
        if (len <= 3) {
            grouped.append(whole);
        } else {
            String leading = whole.substring(0, len - 3);
            int leadLen = leading.length();
            for (int i = 0; i < leadLen; i++) {
                if (i > 0 && (leadLen - i) % 2 == 0) grouped.append(',');
                grouped.append(leading.charAt(i));
            }
            grouped.append(',').append(whole, len - 3, len);
        }
        return (negative ? "-" : "") + grouped + String.format(".%02d", paise);
    }

    /** Page footer: gold rule, company name and page numbers. */
    private static class EpsFooter extends PdfPageEventHelper {
        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            var cb = writer.getDirectContent();
            float pageWidth = document.getPageSize().getWidth();
            float left = document.leftMargin();
            float right = pageWidth - document.rightMargin();
            float y = document.bottomMargin() - 14f;

            // Gold rule
            cb.saveState();
            cb.setColorStroke(GOLD_LIGHT);
            cb.setLineWidth(1.2f);
            cb.moveTo(left, y);
            cb.lineTo(right, y);
            cb.stroke();
            cb.restoreState();

            // Company name (left)
            var company = new Phrase(COMPANY_FOOTER, new Font(Font.HELVETICA, 7.5f, Font.NORMAL, MUTED));
            ColumnText.showTextAligned(cb, Element.ALIGN_LEFT, company, left, y - 9, 0);

            // Page X of Y (right)
            String pageText = "Page " + writer.getPageNumber();
            var pagePhrase = new Phrase(pageText, new Font(Font.HELVETICA, 7.5f, Font.NORMAL, MUTED));
            ColumnText.showTextAligned(cb, Element.ALIGN_RIGHT, pagePhrase, right, y - 9, 0);
        }
    }

    private String v(Object o) {
        return o == null ? "" : String.valueOf(o).replace(",", ";");
    }

}
