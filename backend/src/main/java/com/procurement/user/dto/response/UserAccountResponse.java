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
        Long roleId,
        Long employeeId,
        String employeeCode,
        String displayName,
        String email,
        String phone,
        Long departmentId,
        String departmentName,
        Long costCenterId,
        String costCenterName,
        Long managerId,
        String managerName,
        LocalDateTime lastLogin,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
