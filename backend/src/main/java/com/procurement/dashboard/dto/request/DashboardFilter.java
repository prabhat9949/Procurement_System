package com.procurement.dashboard.dto.request;

import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

public record DashboardFilter(
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
        Long departmentId,
        Long vendorId,
        Long warehouseId,
        String status,
        Long costCenterId
) { }
