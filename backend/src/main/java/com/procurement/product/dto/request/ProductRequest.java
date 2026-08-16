package com.procurement.product.dto.request;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record ProductRequest(
        @NotBlank @Size(max = 50) String productCode,
        @NotBlank @Size(max = 80) String sku,
        @NotBlank @Size(max = 200) String productName,
        @Size(max = 1000) String description,
        @Size(max = 100) String brand,
        @Size(max = 150) String manufacturer,
        @NotNull Long categoryId,
        @NotNull Long vendorId,
        @NotNull Long unitOfMeasureId,
        @NotNull @DecimalMin(value = "0.0", inclusive = true) BigDecimal unitPrice,
        @NotBlank @Size(min = 3, max = 3) String currency,
        @NotNull @PositiveOrZero Integer minimumStock,
        @NotNull @PositiveOrZero Integer maximumStock,
        @NotNull @PositiveOrZero Integer reorderLevel,
        @PositiveOrZero Integer leadTimeDays,
        @PositiveOrZero @DecimalMax("100.0") BigDecimal taxPercentage,
        Boolean active) {
}
