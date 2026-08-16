package com.procurement.audit.dto.request;

import com.procurement.audit.entity.FindingSeverity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AuditFindingRequest(
        @NotBlank String findingType,
        @NotNull FindingSeverity severity,
        @NotBlank String description,
        String relatedRecord,
        String recommendation,
        String evidenceRef
) {
}
