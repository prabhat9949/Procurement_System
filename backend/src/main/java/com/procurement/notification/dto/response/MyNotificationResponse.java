package com.procurement.notification.dto.response;

import com.procurement.notification.entity.NotificationPriority;
import com.procurement.notification.entity.NotificationType;

import java.time.LocalDateTime;

/** Notification as seen by a specific recipient, including their read state. */
public record MyNotificationResponse(
        Long id,
        Long notificationId,
        String notificationNumber,
        String title,
        String message,
        NotificationType type,
        NotificationPriority priority,
        String referenceType,
        Long referenceId,
        Boolean read,
        LocalDateTime createdAt
) {}
