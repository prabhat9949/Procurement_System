package com.procurement.warehouse.dto.request;

import com.procurement.warehouse.entity.WarehouseType;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record WarehouseRequest(
        @NotBlank @Size(max = 30) String warehouseCode,
        @NotBlank @Size(max = 150) String warehouseName,
        @Size(max = 500) String description,
        @NotNull WarehouseType warehouseType,
        @Size(max = 30) String status,
        @Size(max = 150) String managerName,
        @Size(max = 150) String contactPerson,
        @Email @Size(max = 150) String email,
        @Size(max = 30) String phone,
        @Size(max = 255) String addressLine1,
        @Size(max = 255) String addressLine2,
        @Size(max = 100) String city,
        @Size(max = 100) String state,
        @Size(max = 100) String country,
        @Size(max = 20) String postalCode,
        @NotNull @Positive BigDecimal storageCapacity) {
}
