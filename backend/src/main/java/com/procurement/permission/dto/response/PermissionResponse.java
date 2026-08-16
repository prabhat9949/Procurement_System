package com.procurement.permission.dto.response;

import java.time.LocalDateTime;

public record PermissionResponse(
        Long id,
        String permissionCode,
        String permissionName,
        String moduleName,
        String description,
        Boolean active,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
