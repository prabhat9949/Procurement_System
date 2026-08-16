package com.procurement.auth.dto;

import java.util.List;

public record LoginResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        String username,
        String roleCode,
        String roleName,
        String displayName,
        List<String> permissions) {
}
