package com.procurement.user.dto.response;

import com.procurement.user.entity.PermissionAccess;

public record UserPermissionOverrideResponse(
        Long permissionId,
        String permissionCode,
        String permissionName,
        String moduleName,
        PermissionAccess access,
        String reason) {
}
