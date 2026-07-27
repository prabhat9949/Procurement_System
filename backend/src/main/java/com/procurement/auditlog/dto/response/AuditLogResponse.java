package com.procurement.auditlog.dto.response;

import java.time.LocalDateTime;

public record AuditLogResponse(
        Long id,
        String moduleName,
        String entityName,
        Long entityId,
        String operation,
        String referenceNumber,
        String referenceType,
        Long userId,
        String username,
        String performedBy,
        Boolean success,
        String oldValue,
        String newValue,
        String details,
        LocalDateTime performedAt
) {}
