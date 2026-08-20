package com.procurement.notification.dto.response;

public record NotificationPreferenceResponse(
        Long id,
        Long userId,
        Boolean emailEnabled,
        Boolean smsEnabled,
        Boolean inAppEnabled,
        Boolean approvalNotifications,
        Boolean paymentNotifications,
        Boolean rfqNotifications
) {}
