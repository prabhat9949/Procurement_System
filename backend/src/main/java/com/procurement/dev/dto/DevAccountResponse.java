package com.procurement.dev.dto;

/**
 * Development-only summary of a login account for the dev login panel.
 * <p>
 * The development password is included on purpose: these accounts are seeded
 * development/demo accounts and the panel must be able to sign in with one
 * click during local development. The endpoint is gated to the 'dev' profile
 * only, so it is never reachable in production.
 */
public record DevAccountResponse(
        Long userId,
        String name,
        String username,
        String password,
        String roleCode,
        String roleName,
        String category,
        String employeeCode,
        String employeeId,
        String vendorId,
        String vendorName,
        String department,
        String costCenter,
        String managerName,
        String type) {
}
