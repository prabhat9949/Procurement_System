package com.procurement.audit.dto.request;

import com.procurement.audit.entity.FindingStatus;
import jakarta.validation.constraints.NotNull;

public record AuditFindingStatusRequest(
        @NotNull FindingStatus status
) {
}
