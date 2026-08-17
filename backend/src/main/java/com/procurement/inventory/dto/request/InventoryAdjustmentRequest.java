package com.procurement.inventory.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record InventoryAdjustmentRequest(
        @NotNull(message = "Product ID is required")
        Long productId,

        Long warehouseId,

        @NotNull(message = "Quantity change is required")
        BigDecimal quantityChanged,

        @NotBlank(message = "Transaction type is required (RESTOCK, STOCK_ADJUSTMENT, RETURN_TO_STOCK, etc.)")
        String transactionType,

        BigDecimal unitCost,

        @NotBlank(message = "Reason is required for inventory adjustments")
        String reason
) {}
