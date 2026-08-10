package com.procurement.uom.dto.response;

import java.time.LocalDateTime;

public record UomResponse(
        Long id,
        String uomCode,
        String uomName,
        String description,
        Boolean active,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
