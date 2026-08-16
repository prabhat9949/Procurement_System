package com.procurement.payment.dto.response;

import java.math.BigDecimal;

public record PaymentAllocationResponse(
        Long id,
        Long paymentId,
        Long invoiceId,
        BigDecimal allocatedAmount,
        BigDecimal remainingAmount,
        String remarks
) {}
