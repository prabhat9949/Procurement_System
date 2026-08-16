package com.procurement.notification.dto.response;

import com.procurement.notification.entity.*;

import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        String notificationNumber,
        String title,
        String message,
        NotificationType type,
        NotificationPriority priority,
        NotificationStatus status,
        String referenceType,
        Long referenceId,
        Long senderId,
        String senderUsername,
        LocalDateTime createdAt,
        LocalDateTime scheduledAt,
        LocalDateTime sentAt,
        LocalDateTime expiresAt
) {}
