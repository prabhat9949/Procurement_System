package com.procurement.invoice.dto.response;

import com.procurement.invoice.entity.InvoiceStatus;

import java.time.LocalDateTime;

public record InvoiceHistoryResponse(
        Long id,
        Long invoiceId,
        String action,
        InvoiceStatus oldStatus,
        InvoiceStatus newStatus,
        String remarks,
        LocalDateTime performedAt
) {}
