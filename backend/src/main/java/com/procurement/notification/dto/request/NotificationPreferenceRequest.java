package com.procurement.notification.dto.request;

public record NotificationPreferenceRequest(
        Boolean emailEnabled,
        Boolean smsEnabled,
        Boolean inAppEnabled,
        Boolean approvalNotifications,
        Boolean paymentNotifications,
        Boolean rfqNotifications
) {}
