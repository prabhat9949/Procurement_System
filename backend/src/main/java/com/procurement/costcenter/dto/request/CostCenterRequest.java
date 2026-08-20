package com.procurement.costcenter.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record CostCenterRequest(
        @NotBlank @Size(max = 30) String code,
        @NotBlank @Size(max = 150) String name,
        @NotNull Long departmentId,
        @DecimalMin(value = "0.0", inclusive = true) BigDecimal budget,
        Boolean active
) {
}
