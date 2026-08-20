package com.procurement.report.dto.response;

public record ReportExportResponse(
        String fileName,
        String contentType,
        String dataBase64
) {}
