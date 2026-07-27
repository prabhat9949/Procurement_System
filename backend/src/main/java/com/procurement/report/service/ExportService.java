package com.procurement.report.service;

import com.procurement.report.dto.response.ReportExportResponse;
import com.procurement.report.dto.response.ReportRowResponse;

import java.util.List;

public interface ExportService {
    ReportExportResponse csv(String reportType, List<ReportRowResponse> rows);
    ReportExportResponse excel(String reportType, List<ReportRowResponse> rows);
    ReportExportResponse pdf(String reportType, List<ReportRowResponse> rows);
}
