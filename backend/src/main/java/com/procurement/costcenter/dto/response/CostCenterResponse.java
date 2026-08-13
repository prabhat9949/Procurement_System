package com.procurement.costcenter.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CostCenterResponse(
        Long id,
        String code,
        String name,
        Long departmentId,
        String departmentCode,
        String departmentName,
        BigDecimal budget,
        BigDecimal usedBudget,
        BigDecimal remainingBudget,
        Boolean active,
        Long employeeCount,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
