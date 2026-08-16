package com.procurement.user.dto.request;

import jakarta.validation.constraints.Size;

public record AdminUserCredentialUpdateRequest(
        @Size(min = 3, max = 100)
        String username,
        @Size(min = 8, max = 100)
        String newPassword,
        Boolean enabled,
        Boolean accountLocked
) {
}
