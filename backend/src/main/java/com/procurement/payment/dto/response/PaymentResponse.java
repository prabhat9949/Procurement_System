package com.procurement.payment.dto.response;

import com.procurement.payment.entity.PaymentMethod;
import com.procurement.payment.entity.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PaymentResponse(
        Long id,
        String paymentNumber,
        Long vendorId,
        String vendorName,
        Long invoiceId,
        String invoiceNumber,
        Long threeWayMatchId,
        String threeWayMatchNumber,
        Long purchaseOrderId,
        String purchaseOrderNumber,
        LocalDate paymentDate,
        LocalDate scheduledDate,
        PaymentMethod paymentMethod,
        String paymentReference,
        String bankReference,
        String currency,
        BigDecimal grossAmount,
        BigDecimal discountAmount,
        BigDecimal taxDeduction,
        BigDecimal otherDeduction,
        BigDecimal netAmount,
        BigDecimal paidAmount,
        BigDecimal balanceAmount,
        PaymentStatus status,
        String remarks
) {}
