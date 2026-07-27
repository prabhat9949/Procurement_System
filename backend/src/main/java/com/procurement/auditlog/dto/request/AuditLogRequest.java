package com.procurement.auditlog.dto.request;

import jakarta.validation.constraints.NotBlank;

public record AuditLogRequest(
        @NotBlank String moduleName,
        @NotBlank String entityName,
        Long entityId,
        @NotBlank String operation,
        String referenceNumber,
        String referenceType,
        Long userId,
        Boolean success,
        String oldValue,
        String newValue,
        String details
) {}
