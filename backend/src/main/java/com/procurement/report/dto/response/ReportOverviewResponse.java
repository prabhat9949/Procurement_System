package com.procurement.report.dto.response;

import java.util.List;

public record ReportOverviewResponse(
        String reportType,
        List<String> columns,
        List<ReportRowResponse> rows
) {}
