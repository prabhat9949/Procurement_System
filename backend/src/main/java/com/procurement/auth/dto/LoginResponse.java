package com.procurement.auth.dto;

public record LoginResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        String username) {
}
