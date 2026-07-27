package com.procurement.warehouse.dto.response;

import com.procurement.warehouse.entity.WarehouseType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record WarehouseResponse(
        Long id,
        String warehouseCode,
        String warehouseName,
        String description,
        WarehouseType warehouseType,
        String status,
        String managerName,
        String contactPerson,
        String email,
        String phone,
        String addressLine1,
        String addressLine2,
        String city,
        String state,
        String country,
        String postalCode,
        BigDecimal storageCapacity,
        String createdBy,
        String updatedBy,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
}
