package com.procurement.event;

import com.procurement.notification.dto.request.NotificationRequest;
import com.procurement.notification.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/** Creates in-app notification records without coupling workflow services to notification persistence. */
@Component
public class BusinessEventNotificationListener {
    private static final Logger log = LoggerFactory.getLogger(BusinessEventNotificationListener.class);
    private final NotificationService notificationService;

    public BusinessEventNotificationListener(NotificationService notificationService) { this.notificationService = notificationService; }

    @EventListener
    public void notify(BusinessEvent event) {
        try {
            notificationService.create(new NotificationRequest(event.type().name(), event.message(),
                    event.notificationType(), event.priority(), event.entityName(), event.entityId(), null, null, null));
        } catch (RuntimeException exception) {
            log.error("Unable to create notification for event {}", event.type(), exception);
        }
    }
}
