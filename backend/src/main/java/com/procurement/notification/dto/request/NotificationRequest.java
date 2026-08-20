package com.procurement.notification.dto.request;

import com.procurement.notification.entity.NotificationPriority;
import com.procurement.notification.entity.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record NotificationRequest(
        @NotBlank String title,
        @NotBlank String message,
        @NotNull NotificationType type,
        @NotNull NotificationPriority priority,
        String referenceType,
        Long referenceId,
        Long senderId,
        LocalDateTime scheduledAt,
        LocalDateTime expiresAt
) {}
