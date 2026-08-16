package com.procurement.audit.dto.response;

import com.procurement.audit.entity.FindingSeverity;
import com.procurement.audit.entity.FindingStatus;

import java.time.LocalDateTime;

public record AuditFindingResponse(
        Long id,
        Long auditCaseId,
        String findingType,
        FindingSeverity severity,
        FindingStatus status,
        String description,
        String relatedRecord,
        String recommendation,
        String evidenceRef,
        String createdBy,
        LocalDateTime createdAt,
        LocalDateTime resolvedAt
) {
}
