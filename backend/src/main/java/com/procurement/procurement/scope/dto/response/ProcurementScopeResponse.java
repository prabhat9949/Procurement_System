package com.procurement.procurement.scope.dto.response;

import java.util.List;

/**
 * The authenticated user's procurement scope. `scoped` is false when the user
 * is not a procurement officer or has no configured category scope (i.e. they
 * see all categories).
 */
public record ProcurementScopeResponse(
        Long officerEmployeeId,
        String officerName,
        String roleCode,
        String roleName,
        boolean scoped,
        List<Long> categoryIds,
        List<String> categoryNames) {
}
