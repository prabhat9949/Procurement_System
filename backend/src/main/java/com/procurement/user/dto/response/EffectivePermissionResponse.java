package com.procurement.user.dto.response;

/**
 * One resolved permission for a user.
 *
 * @param allowed   true when the user currently holds this permission
 * @param source    "ROLE" or "USER_OVERRIDE"
 * @param overridden true when a user-specific override exists for this permission
 */
public record EffectivePermissionResponse(
        Long permissionId,
        String permissionCode,
        String permissionName,
        String moduleName,
        boolean allowed,
        String source,
        boolean overridden) {
}
