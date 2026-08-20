package com.procurement.auditlog.exception;

import com.procurement.common.exception.ResourceNotFoundException;

public class AuditLogException extends ResourceNotFoundException {
    public AuditLogException(Long id) {
        super("Audit log not found: " + id);
    }
}
