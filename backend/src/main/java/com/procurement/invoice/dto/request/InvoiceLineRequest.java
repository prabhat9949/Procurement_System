package com.procurement.invoice.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record InvoiceLineRequest(
        @NotNull Long purchaseOrderLineId,
        @NotNull Long goodsReceiptLineId,
        @NotNull Long productId,
        @NotNull @DecimalMin("0.0") BigDecimal quantity,
        @NotNull @DecimalMin("0.0") BigDecimal unitPrice,
        @DecimalMin("0.0") BigDecimal discountPercentage,
        @DecimalMin("0.0") BigDecimal taxPercentage,
        String remarks
) {}
