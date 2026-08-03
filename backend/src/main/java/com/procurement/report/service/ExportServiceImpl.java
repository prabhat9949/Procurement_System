package com.procurement.report.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import com.procurement.report.dto.response.ReportExportResponse;
import com.procurement.report.dto.response.ReportRowResponse;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;

@Service
public class ExportServiceImpl implements ExportService {
    private ReportExportResponse response(String type, String ext, String contentType, byte[] bytes) {
        return new ReportExportResponse(type + "." + ext, contentType, Base64.getEncoder().encodeToString(bytes));
    }
    public ReportExportResponse csv(String reportType, List<ReportRowResponse> rows) {
        var sb = new StringBuilder("id,referenceNumber,title,status,relatedOne,relatedTwo,relatedThree,date,quantity,amount,remarks\n");
        for (var r : rows) {
            sb.append(v(r.id())).append(',').append(v(r.referenceNumber())).append(',').append(v(r.title())).append(',').append(v(r.status())).append(',').append(v(r.relatedOne())).append(',').append(v(r.relatedTwo())).append(',').append(v(r.relatedThree())).append(',').append(v(r.date())).append(',').append(v(r.quantity())).append(',').append(v(r.amount())).append(',').append(v(r.remarks())).append('\n');
        }
        return response(reportType, "csv", "text/csv", sb.toString().getBytes(StandardCharsets.UTF_8));
    }
    public ReportExportResponse excel(String reportType, List<ReportRowResponse> rows) {
        try (var wb = new XSSFWorkbook(); var out = new ByteArrayOutputStream()) {
            var sheet = wb.createSheet(reportType);
            var header = sheet.createRow(0);
            String[] cols = {"id","referenceNumber","title","status","relatedOne","relatedTwo","relatedThree","date","quantity","amount","remarks"};
            for (int i = 0; i < cols.length; i++) header.createCell(i).setCellValue(cols[i]);
            int rowIdx = 1;
            for (var r : rows) {
                Row row = sheet.createRow(rowIdx++);
                Object[] vals = {r.id(), r.referenceNumber(), r.title(), r.status(), r.relatedOne(), r.relatedTwo(), r.relatedThree(), r.date(), r.quantity(), r.amount(), r.remarks()};
                for (int i = 0; i < vals.length; i++) row.createCell(i).setCellValue(vals[i] == null ? "" : vals[i].toString());
            }
            wb.write(out);
            return response(reportType, "xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", out.toByteArray());
        } catch (Exception e) {
            throw new IllegalStateException("Failed to export Excel report", e);
        }
    }
    public ReportExportResponse pdf(String reportType, List<ReportRowResponse> rows) {
        try (var out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4.rotate());
            PdfWriter.getInstance(document, out);
            document.open();
            document.add(new Paragraph(reportType + " report"));
            document.add(new Paragraph("Rows: " + rows.size()));
            for (var r : rows) document.add(new Paragraph(String.valueOf(r)));
            document.close();
            return response(reportType, "pdf", "application/pdf", out.toByteArray());
        } catch (Exception e) {
            throw new IllegalStateException("Failed to export PDF report", e);
        }
    }
    private String v(Object o){return o==null?"":String.valueOf(o).replace(",",";");}
}
