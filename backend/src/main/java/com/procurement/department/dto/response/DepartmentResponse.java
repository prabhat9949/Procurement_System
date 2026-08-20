package com.procurement.department.dto.response;

import java.time.LocalDateTime;

public record DepartmentResponse(
        Long id,
        String departmentCode,
        String departmentName,
        String description,
        Boolean active,
        Long employeeCount,
        Long costCenterCount,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
