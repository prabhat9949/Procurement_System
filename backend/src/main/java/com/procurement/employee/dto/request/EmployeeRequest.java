package com.procurement.employee.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Schema(name = "EmployeeRequest", description = "Employee create or update request used by Admin and HR")
public record EmployeeRequest(
        @Schema(example = "Rahul")
        @NotBlank @Size(max = 100) String firstName,
        @Schema(example = "Sharma")
        @NotBlank @Size(max = 100) String lastName,
        @Schema(example = "rahul.sharma@company.com")
        @NotBlank @Email @Size(max = 150) String email,
        @Schema(example = "9876543210")
        @Size(max = 20) String phone,
        @Schema(example = "2")
        @NotNull Long departmentId,
        @Schema(example = "3")
        @NotNull Long costCenterId,
        @Schema(example = "6")
        @NotNull Long roleId,
        @Schema(example = "5")
        Long managerId,
        @Schema(example = "true")
        Boolean active
) {
}
