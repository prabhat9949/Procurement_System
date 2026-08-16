package com.procurement.role.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record RoleRequest(
        @NotBlank @Size(max = 50) String roleCode,
        @NotBlank @Size(max = 100) String roleName,
        @Size(max = 500) String description,
        Boolean systemRole,
        Boolean active,
        List<Long> permissionIds
) {
}
