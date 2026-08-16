package com.procurement.role.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public record RoleResponse(
        Long id,
        String roleCode,
        String roleName,
        String description,
        Boolean systemRole,
        Boolean active,
        Long userCount,
        List<Long> permissionIds,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
