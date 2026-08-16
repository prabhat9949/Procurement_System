package com.procurement.audit.dto.request;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record AuditCaseRequest(
        @NotNull Long purchaseRequestId,
        LocalDate dueDate
) {
}
