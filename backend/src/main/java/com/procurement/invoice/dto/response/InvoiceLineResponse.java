package com.procurement.invoice.dto.response;

import java.math.BigDecimal;

public record InvoiceLineResponse(
        Long id,
        Long invoiceId,
        Long purchaseOrderLineId,
        Long goodsReceiptLineId,
        Long productId,
        String productName,
        BigDecimal quantity,
        BigDecimal unitPrice,
        BigDecimal discountPercentage,
        BigDecimal taxPercentage,
        BigDecimal lineAmount,
        String remarks
) {}
