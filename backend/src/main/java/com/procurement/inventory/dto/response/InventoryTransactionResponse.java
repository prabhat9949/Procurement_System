package com.procurement.inventory.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record InventoryTransactionResponse(
        Long id,
        String transactionNumber,
        Long productId,
        String productCode,
        String productName,
        String sku,
        Long warehouseId,
        String warehouseName,
        String transactionType,
        BigDecimal quantityBefore,
        BigDecimal quantityChanged,
        BigDecimal quantityAfter,
        BigDecimal unitCost,
        BigDecimal totalValue,
        String referenceType,
        Long referenceId,
        String referenceNumber,
        Long performedById,
        String performedByName,
        String requesterName,
        String departmentName,
        String reason,
        String actorUsername,
        LocalDateTime createdAt
) {}
