package com.procurement.notification.dto.response;

import com.procurement.notification.entity.NotificationType;

public record NotificationTemplateResponse(
        Long id,
        String templateCode,
        String titleTemplate,
        String bodyTemplate,
        NotificationType notificationType,
        Boolean active
) {}
