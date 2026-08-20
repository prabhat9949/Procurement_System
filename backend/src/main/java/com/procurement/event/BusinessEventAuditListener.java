package com.procurement.event;

import com.procurement.auditlog.service.AuditLogService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;

/** Keeps audit recording outside business services. Listener failures never roll back a completed workflow. */
@Component
public class BusinessEventAuditListener {
    private static final Logger log = LoggerFactory.getLogger(BusinessEventAuditListener.class);
    private final AuditLogService auditLogService;
    private final TransactionTemplate txTemplate;

    public BusinessEventAuditListener(AuditLogService auditLogService,
                                      PlatformTransactionManager transactionManager) {
        this.auditLogService = auditLogService;
        this.txTemplate = new TransactionTemplate(transactionManager);
        this.txTemplate.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }

    @EventListener
    public void record(BusinessEvent event) {
        try {
            txTemplate.executeWithoutResult(status ->
                    auditLogService.record(event.module(), event.entityName(), event.entityId(), event.type().name(),
                            event.referenceNumber(), event.entityName(), true, null, null, event.message()));
        } catch (RuntimeException exception) {
            log.error("Unable to persist audit event {} for {}", event.type(), event.referenceNumber(), exception);
        }
    }
}
