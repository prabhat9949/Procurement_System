package com.procurement.event;

import com.procurement.notification.entity.NotificationPriority;
import com.procurement.notification.entity.NotificationType;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

@Component
public class BusinessEventPublisher {
    private final ApplicationEventPublisher publisher;

    public BusinessEventPublisher(ApplicationEventPublisher publisher) { this.publisher = publisher; }

    public void publish(BusinessEventType type, String module, String entityName, Long entityId,
                        String referenceNumber, String message, String actor, NotificationType notificationType) {
        publisher.publishEvent(new BusinessEvent(type, module, entityName, entityId, referenceNumber,
                message, actor, notificationType, NotificationPriority.HIGH));
    }
}
