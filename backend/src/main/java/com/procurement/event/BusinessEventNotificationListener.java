package com.procurement.event;

import com.procurement.notification.dto.request.NotificationRequest;
import com.procurement.notification.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;

/** Creates in-app notification records without coupling workflow services to notification persistence. */
@Component
public class BusinessEventNotificationListener {
    private static final Logger log = LoggerFactory.getLogger(BusinessEventNotificationListener.class);
    private final NotificationService notificationService;
    private final TransactionTemplate txTemplate;

    public BusinessEventNotificationListener(NotificationService notificationService,
                                             PlatformTransactionManager transactionManager) {
        this.notificationService = notificationService;
        this.txTemplate = new TransactionTemplate(transactionManager);
        this.txTemplate.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }

    @EventListener
    public void notify(BusinessEvent event) {
        // Notifications are side-effects: persist in their own transaction so a
        // failure (e.g. a transient notification-number collision) can never roll
        // back the login or workflow transaction that published the event.
        for (int attempt = 0; attempt < 3; attempt++) {
            try {
                txTemplate.executeWithoutResult(status ->
                        notificationService.create(new NotificationRequest(event.type().name(), event.message(),
                                event.notificationType(), event.priority(), event.entityName(), event.entityId(), null, null, null)));
                return;
            } catch (DataIntegrityViolationException duplicate) {
                // Number collision under concurrency — regenerate and retry.
            } catch (RuntimeException exception) {
                log.error("Unable to create notification for event {}", event.type(), exception);
                return;
            }
        }
        log.error("Giving up on notification for event {} after repeated collisions", event.type());
    }
}
