package com.procurement.category.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoryRequest(
        @NotBlank @Size(max = 50) String categoryCode,
        @NotBlank @Size(max = 150) String categoryName,
        @Size(max = 500) String description,
        Long parentCategoryId,
        Boolean active
) {
}
