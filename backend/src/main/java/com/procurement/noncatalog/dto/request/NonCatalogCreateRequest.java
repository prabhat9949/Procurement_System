package com.procurement.noncatalog.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record NonCatalogCreateRequest(
        @NotBlank(message = "Item name is required")
        String itemName,

        String description,

        Long categoryId,

        @NotNull(message = "Quantity is required")
        @DecimalMin(value = "0.01", message = "Quantity must be greater than zero")
        BigDecimal quantity,

        Long unitOfMeasureId,

        BigDecimal estimatedUnitPrice,

        String businessJustification,

        String specifications,

        String preferredVendor,

        LocalDate requiredDate
) {}
