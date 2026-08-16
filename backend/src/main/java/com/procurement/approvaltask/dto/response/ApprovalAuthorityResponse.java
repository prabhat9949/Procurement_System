package com.procurement.approvaltask.dto.response;

import java.math.BigDecimal;

/**
 * The logged-in approver's configured approval authority, derived from the
 * active approval rules and stages that route to their role. Minimum/maximum
 * amounts come from the rule ranges; the higher role is the next approval
 * stage configured after this role in the workflow.
 */
public record ApprovalAuthorityResponse(
        String roleCode,
        String roleName,
        BigDecimal minimumAmount,
        BigDecimal maximumAmount,
        Integer slaDays,
        String higherRoleCode,
        String higherRoleName) {
}
