package com.procurement.payment.dto.response;

import com.procurement.payment.entity.PaymentStatus;

import java.time.LocalDateTime;

public record PaymentHistoryResponse(
        Long id,
        Long paymentId,
        String action,
        String performedBy,
        PaymentStatus oldStatus,
        PaymentStatus newStatus,
        String remarks,
        LocalDateTime performedAt
) {}
