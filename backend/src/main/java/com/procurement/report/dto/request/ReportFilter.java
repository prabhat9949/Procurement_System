package com.procurement.report.dto.request;

import java.time.LocalDate;

public record ReportFilter(
        LocalDate startDate,
        LocalDate endDate,
        Long departmentId,
        Long vendorId,
        Long warehouseId,
        Long categoryId,
        Long productId,
        String status,
        Long employeeId,
        Long costCenterId
) {}
