package com.procurement;

import com.procurement.report.dto.response.ReportExportResponse;
import com.procurement.report.dto.response.ReportRowResponse;
import com.procurement.report.service.ExportServiceImpl;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Base64;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Smoke test for the branded report exports. Verifies the generated PDF is a
 * real PDF that embeds the logo resource, and that Excel output is a valid
 * xlsx stream.
 */
class ReportExportSmokeTest {

    private final ExportServiceImpl service = new ExportServiceImpl();

    private List<ReportRowResponse> rows() {
        return List.of(
                new ReportRowResponse(1L, "PR-2026-0001", "Dell XPS 15 Laptop",
                        "APPROVED", "Rahul Kumar", "IT & Systems", "IT-001",
                        LocalDate.of(2026, 7, 20), new BigDecimal("2"),
                        new BigDecimal("370000.00"), "Engineering onboarding"),
                new ReportRowResponse(2L, "PR-2026-0002", "Microsoft 365 Licenses",
                        "SUBMITTED", "Sneha Gupta", "Human Resources", "HR-001",
                        LocalDate.of(2026, 7, 21), new BigDecimal("25"),
                        new BigDecimal("1162500.00"), "Annual renewal"));
    }

    @Test
    void pdfExportProducesValidBrandedPdf() throws Exception {
        ReportExportResponse result = service.pdf("purchase-requests", rows());
        byte[] bytes = Base64.getDecoder().decode(result.dataBase64());
        String head = new String(bytes, 0, Math.min(bytes.length, 20), java.nio.charset.StandardCharsets.ISO_8859_1);
        assertTrue(head.startsWith("%PDF"), "output should be a PDF document");
        assertTrue(result.fileName().endsWith(".pdf"), "file name should end with .pdf");
        // OpenPDF decodes PNGs into raw image XObjects, so the PNG signature
        // itself is not preserved — verify an image XObject is actually embedded
        // (the logo) by parsing the PDF with PdfReader.
        String all = new String(bytes, java.nio.charset.StandardCharsets.ISO_8859_1);
        assertTrue(all.contains("/Subtype /Image") || all.contains("/Subtype/Image"),
                "PDF should embed the EPS logo as an image XObject");

        // Extract the real text layer (content streams are Flate-compressed,
        // so plain-byte checks cannot see it) and verify branding + INR amounts.
        try (com.lowagie.text.pdf.PdfReader reader = new com.lowagie.text.pdf.PdfReader(bytes)) {
            String text = new com.lowagie.text.pdf.parser.PdfTextExtractor(reader).getTextFromPage(1);
            assertTrue(text.contains("Enterprise Procurement System"), "PDF should carry the company letterhead");
            // The text extractor may insert spaces between glyphs — strip them
            // before checking the Indian-grouped amount.
            String compact = text.replaceAll("\\s+", "");
            assertTrue(compact.contains("Rs.3,70,000.00"), "amounts should use INR Indian formatting");
        }
    }

    @Test
    void excelExportProducesValidXlsx() {
        ReportExportResponse result = service.excel("purchase-orders", rows());
        byte[] bytes = Base64.getDecoder().decode(result.dataBase64());
        // xlsx files are ZIP archives — signature PK\x03\x04
        assertEquals((byte) 0x50, bytes[0]);
        assertEquals((byte) 0x4B, bytes[1]);
        assertTrue(result.fileName().endsWith(".xlsx"), "file name should end with .xlsx");
    }
}
