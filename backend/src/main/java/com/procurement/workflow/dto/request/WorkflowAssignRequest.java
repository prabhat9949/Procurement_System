package com.procurement.workflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record WorkflowAssignRequest(
        @NotBlank @Size(max = 30) String entityType,
        @NotNull Long entityId,
        @NotBlank @Size(max = 50) String stage,
        @NotNull Long assignedEmployeeId,
        @Size(max = 50) String action,
        @Size(max = 1000) String reason) {
}
