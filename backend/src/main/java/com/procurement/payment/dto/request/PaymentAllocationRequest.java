package com.procurement.payment.dto.request;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record PaymentAllocationRequest(
        @NotNull Long invoiceId,
        @NotNull BigDecimal allocatedAmount,
        String remarks
) {}
