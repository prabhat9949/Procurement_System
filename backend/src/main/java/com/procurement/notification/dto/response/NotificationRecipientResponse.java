package com.procurement.notification.dto.response;

import com.procurement.notification.entity.*;

import java.time.LocalDateTime;

public record NotificationRecipientResponse(
        Long id,
        Long notificationId,
        Long userId,
        String username,
        DeliveryChannel deliveryChannel,
        Boolean readFlag,
        LocalDateTime readAt,
        DeliveryStatus deliveryStatus
) {}
