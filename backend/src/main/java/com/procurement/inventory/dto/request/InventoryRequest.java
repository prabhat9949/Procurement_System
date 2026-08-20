package com.procurement.inventory.dto.request;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record InventoryRequest(
        @NotNull Long productId,
        @NotNull Long warehouseId,
        @NotNull @PositiveOrZero BigDecimal availableQuantity,
        @NotNull @PositiveOrZero BigDecimal reservedQuantity,
        @NotNull @PositiveOrZero BigDecimal damagedQuantity,
        @NotNull @PositiveOrZero BigDecimal minimumStock,
        @NotNull @PositiveOrZero BigDecimal maximumStock,
        @NotNull @PositiveOrZero BigDecimal reorderLevel,
        @NotNull @PositiveOrZero BigDecimal averageUnitCost,
        @Size(max = 30) String status) {
}
