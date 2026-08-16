package com.procurement.auditlog.dto.response;

public record AuditLogExportResponse(
        String fileName,
        String contentType,
        String dataBase64
) {}
