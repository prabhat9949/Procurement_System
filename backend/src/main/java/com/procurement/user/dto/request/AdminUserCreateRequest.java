package com.procurement.user.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record AdminUserCreateRequest(
        @NotBlank @Size(max = 100) String username,
        @NotBlank @Size(min = 8, max = 100) String password,
        @NotBlank @Size(max = 100) String firstName,
        @NotBlank @Size(max = 100) String lastName,
        @NotBlank @Email @Size(max = 150) String email,
        @Size(max = 20) String phone,
        @NotNull Long roleId,
        @NotNull Long departmentId,
        @NotNull Long costCenterId,
        Long managerId,
        @Size(max = 30) String employeeCode,
        @DecimalMin(value = "0.0", inclusive = true) BigDecimal initialBudget,
        Boolean enabled
) {
}
