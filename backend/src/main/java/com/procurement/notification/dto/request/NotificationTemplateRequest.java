package com.procurement.notification.dto.request;

import com.procurement.notification.entity.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record NotificationTemplateRequest(
        @NotBlank String templateCode,
        @NotBlank String titleTemplate,
        @NotBlank String bodyTemplate,
        @NotNull NotificationType notificationType,
        Boolean active
) {}
