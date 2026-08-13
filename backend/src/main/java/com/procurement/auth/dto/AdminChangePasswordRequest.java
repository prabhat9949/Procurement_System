package com.procurement.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AdminChangePasswordRequest(
        @NotBlank String targetUsername,
        @NotBlank @Size(min = 8, max = 100) String newPassword) {
}
