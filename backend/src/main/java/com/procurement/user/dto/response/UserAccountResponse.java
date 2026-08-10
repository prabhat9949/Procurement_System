package com.procurement.user.dto.response;

import java.time.LocalDateTime;

public record UserAccountResponse(
        Long id,
        String username,
        String password,
        Boolean enabled,
        Boolean accountLocked,
        String roleCode,
        String roleName,
        Long employeeId,
        String employeeCode,
        String displayName,
        String email,
        LocalDateTime lastLogin,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
