package com.procurement.fulfilment.dto.response;

import java.math.BigDecimal;

public record AvailabilityLineDetail(
        Long lineId,
        Long productId,
        String productCode,
        String productName,
        String categoryName,
        String teamRoleCode,
        Boolean isDigital,
        BigDecimal requestedQuantity,
        BigDecimal availableQuantity,
        BigDecimal reservedQuantity,
        BigDecimal shortageQuantity,
        Boolean fullyAvailable,
        Boolean partiallyAvailable,
        Boolean unavailable,
        String warehouseName,
        Long warehouseId
) {}
