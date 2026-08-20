package com.procurement.fulfilment.dto.request;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public record InitiateFulfilmentRequest(
        Long purchaseRequestId,
        @NotBlank(message = "Fulfilment action mode is required (FULL_INTERNAL, PARTIAL_FULFILMENT, EXTERNAL_PROCUREMENT)")
        String actionType,
        Long assignedEmployeeId,
        Long warehouseId,
        BigDecimal quantityToFulfilInternally,
        BigDecimal quantityForExternalProcurement,
        String remarks
) {}
