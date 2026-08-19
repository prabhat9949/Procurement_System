package com.procurement.audit.dto.request;

import jakarta.validation.constraints.NotBlank;

public record AuditConclusionRequest(
        @NotBlank String conclusion,
        String auditSummary,
        String recommendation
) {
}
