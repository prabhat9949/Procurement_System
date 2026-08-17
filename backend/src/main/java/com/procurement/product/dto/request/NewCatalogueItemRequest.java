package com.procurement.product.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/**
 * Lightweight "add to catalogue" request used by employees (non-catalogue item
 * request) and the consolidated Warehouse / Inventory dashboard. The backend
 * auto-generates the product code/SKU and applies sensible defaults for vendor,
 * UoM, stock levels and tax so the item immediately appears in the catalogue.
 */
public record NewCatalogueItemRequest(
        @NotBlank @Size(max = 200) String productName,
        @Size(max = 1000) String description,
        @Size(max = 100) String brand,
        @NotNull Long categoryId,
        @NotNull @DecimalMin(value = "0.0", inclusive = true) BigDecimal unitPrice,
        @Size(max = 3) String currency,
        Boolean isDigital) {
}
