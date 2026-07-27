package com.procurement.payment.dto.request;

import com.procurement.payment.entity.PaymentMethod;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PaymentRequest(
        @NotNull Long invoiceId,
        @NotNull Long threeWayMatchId,
        @NotNull Long purchaseOrderId,
        @NotNull LocalDate paymentDate,
        LocalDate scheduledDate,
        @NotNull PaymentMethod paymentMethod,
        String paymentReference,
        String bankReference,
        String currency,
        BigDecimal grossAmount,
        BigDecimal discountAmount,
        BigDecimal taxDeduction,
        BigDecimal otherDeduction,
        String remarks
) {}
