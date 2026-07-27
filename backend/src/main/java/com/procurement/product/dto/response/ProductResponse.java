package com.procurement.product.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProductResponse(
        Long id,
        String productCode,
        String sku,
        String productName,
        String description,
        String brand,
        String manufacturer,
        Long categoryId,
        String categoryName,
        Long vendorId,
        String vendorName,
        Long unitOfMeasureId,
        String uomCode,
        String uomName,
        BigDecimal unitPrice,
        String currency,
        Integer minimumStock,
        Integer maximumStock,
        Integer reorderLevel,
        Integer leadTimeDays,
        BigDecimal taxPercentage,
        Boolean active,
        String createdBy,
        String updatedBy,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
}
