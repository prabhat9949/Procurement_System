package com.procurement.inventory.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record InventoryResponse(
        Long id,
        Long productId,
        String productCode,
        String productName,
        Long warehouseId,
        String warehouseCode,
        String warehouseName,
        BigDecimal availableQuantity,
        BigDecimal reservedQuantity,
        BigDecimal damagedQuantity,
        BigDecimal minimumStock,
        BigDecimal maximumStock,
        BigDecimal reorderLevel,
        BigDecimal averageUnitCost,
        BigDecimal inventoryValue,
        LocalDateTime lastStockUpdate,
        String status,
        String createdBy,
        String updatedBy,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
}
