package com.procurement.event;

import com.procurement.auditlog.service.AuditLogService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/** Keeps audit recording outside business services. Listener failures never roll back a completed workflow. */
@Component
public class BusinessEventAuditListener {
    private static final Logger log = LoggerFactory.getLogger(BusinessEventAuditListener.class);
    private final AuditLogService auditLogService;

    public BusinessEventAuditListener(AuditLogService auditLogService) { this.auditLogService = auditLogService; }

    @EventListener
    public void record(BusinessEvent event) {
        try {
            auditLogService.record(event.module(), event.entityName(), event.entityId(), event.type().name(),
                    event.referenceNumber(), event.entityName(), true, null, null, event.message());
        } catch (RuntimeException exception) {
            log.error("Unable to persist audit event {} for {}", event.type(), event.referenceNumber(), exception);
        }
    }
}
