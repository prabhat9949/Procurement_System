package com.procurement.workflow.dto.request;

import jakarta.validation.constraints.Size;

public record WorkflowCompleteRequest(
        @Size(max = 50) String action,
        @Size(max = 1000) String comment) {
}
