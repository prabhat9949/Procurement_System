package com.procurement.department.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DepartmentRequest(
        @NotBlank @Size(max = 30) String departmentCode,
        @NotBlank @Size(max = 150) String departmentName,
        @Size(max = 500) String description,
        Boolean active
) {
}
