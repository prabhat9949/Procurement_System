package com.procurement.auditlog.mapper;

import com.procurement.auditlog.dto.response.AuditLogResponse;
import com.procurement.auditlog.entity.AuditLog;
import org.springframework.stereotype.Component;

@Component
public class AuditLogMapper {
    public AuditLogResponse toResponse(AuditLog e) {
        return new AuditLogResponse(
                e.getId(),
                e.getModuleName(),
                e.getEntityName(),
                e.getEntityId(),
                e.getOperation(),
                e.getReferenceNumber(),
                e.getReferenceType(),
                e.getUser() == null ? null : e.getUser().getId(),
                e.getUser() == null ? null : e.getUser().getUsername(),
                e.getPerformedBy(),
                e.getSuccess(),
                e.getOldValue(),
                e.getNewValue(),
                e.getDetails(),
                e.getPerformedAt()
        );
    }
}
