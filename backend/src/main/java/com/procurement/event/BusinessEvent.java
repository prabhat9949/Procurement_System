package com.procurement.event;

import com.procurement.notification.entity.NotificationPriority;
import com.procurement.notification.entity.NotificationType;

/** Immutable event payload. Business modules publish this; listeners handle side effects. */
public record BusinessEvent(
        BusinessEventType type,
        String module,
        String entityName,
        Long entityId,
        String referenceNumber,
        String message,
        String actor,
        NotificationType notificationType,
        NotificationPriority priority
) { }
