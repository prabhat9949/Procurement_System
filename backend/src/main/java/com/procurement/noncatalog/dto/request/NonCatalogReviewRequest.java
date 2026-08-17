package com.procurement.noncatalog.dto.request;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public record NonCatalogReviewRequest(
        @NotBlank(message = "Review action is required (APPROVE, RETURN, REJECT, LINK_PRODUCT, CREATE_PRODUCT)")
        String action,

        String remarks,

        Long linkProductId,

        // If creating product master
        String productCode,
        String sku,
        String brand,
        Long vendorId,
        BigDecimal unitPrice,
        Integer openingStock
) {}
