package com.procurement.workflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record WorkflowReassignRequest(
        @NotNull Long newAssigneeEmployeeId,
        @NotBlank @Size(max = 1000) String reason) {
}
