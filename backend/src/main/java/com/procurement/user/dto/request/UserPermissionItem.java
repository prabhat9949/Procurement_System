package com.procurement.user.dto.request;

import com.procurement.user.entity.PermissionAccess;
import jakarta.validation.constraints.NotNull;

public record UserPermissionItem(
        @NotNull Long permissionId,
        @NotNull PermissionAccess access,
        String reason) {
}
