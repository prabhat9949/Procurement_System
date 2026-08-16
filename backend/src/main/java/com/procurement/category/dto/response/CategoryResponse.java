package com.procurement.category.dto.response;

import java.time.LocalDateTime;

public record CategoryResponse(
        Long id,
        String categoryCode,
        String categoryName,
        String description,
        Long parentCategoryId,
        String parentCategoryName,
        Boolean active,
        Long productCount,
        Long subCategoryCount,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
