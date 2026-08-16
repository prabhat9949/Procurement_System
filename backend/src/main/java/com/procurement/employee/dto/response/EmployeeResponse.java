package com.procurement.employee.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(name = "EmployeeResponse", description = "Employee details returned by the backend")
public record EmployeeResponse(
        @Schema(example = "12")
        Long id,
        @Schema(example = "EMP000012")
        String employeeCode,
        String firstName,
        String lastName,
        String email,
        String phone,
        Long departmentId,
        String departmentCode,
        String departmentName,
        Long costCenterId,
        String costCenterCode,
        String costCenterName,
        Long roleId,
        String roleCode,
        String roleName,
        Long managerId,
        String managerEmployeeCode,
        String managerName,
        Boolean active,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
