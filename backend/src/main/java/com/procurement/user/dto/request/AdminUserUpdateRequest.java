package com.procurement.user.dto.request;

import jakarta.validation.constraints.Size;

public record AdminUserUpdateRequest(
        @Size(max = 100) String username,
        @Size(min = 8, max = 100) String newPassword,
        @Size(max = 100) String firstName,
        @Size(max = 100) String lastName,
        @jakarta.validation.constraints.Email @Size(max = 150) String email,
        @Size(max = 20) String phone,
        Long roleId,
        Long departmentId,
        Long costCenterId,
        Long managerId,
        Boolean enabled,
        Boolean accountLocked
) {
}
