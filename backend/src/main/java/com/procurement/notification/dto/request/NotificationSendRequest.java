package com.procurement.notification.dto.request;

import com.procurement.notification.entity.DeliveryChannel;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record NotificationSendRequest(
        @NotNull List<Long> recipientUserIds,
        @NotNull List<DeliveryChannel> deliveryChannels
) {}
