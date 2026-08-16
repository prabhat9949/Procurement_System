package com.procurement.purchaserequestline.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record PurchaseRequestLineRequest(
        @NotNull Long purchaseRequestId,
        @NotNull Long productId,
        @NotNull @Positive BigDecimal quantity,
        @NotNull @DecimalMin(value = "0.0", inclusive = true) BigDecimal unitPrice,
        @Size(max = 500) String remarks) {
}
