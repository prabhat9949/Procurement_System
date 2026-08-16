package com.procurement.auditlog.service;

import com.procurement.auditlog.dto.request.AuditLogRequest;
import com.procurement.auditlog.dto.response.*;
import com.procurement.common.response.PageResponse;
import org.springframework.data.domain.Pageable;

public interface AuditLogService {
    AuditLogResponse record(AuditLogRequest request);
    AuditLogResponse record(String moduleName, String entityName, Long entityId, String operation, String referenceNumber, String referenceType, boolean success, String oldValue, String newValue, String details);
    PageResponse<AuditLogResponse> search(String moduleName, String entityName, String operation, Long userId, java.time.LocalDate startDate, java.time.LocalDate endDate, Boolean success, String referenceNumber, Pageable pageable);
    AuditLogResponse get(Long id);
    AuditLogExportResponse export(String moduleName, String entityName, String operation, Long userId, java.time.LocalDate startDate, java.time.LocalDate endDate, Boolean success, String referenceNumber);
}
