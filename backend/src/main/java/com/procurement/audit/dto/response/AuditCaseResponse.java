package com.procurement.audit.dto.response;

import com.procurement.audit.entity.AuditRiskLevel;
import com.procurement.audit.entity.AuditStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record AuditCaseResponse(
        Long id,
        String caseNumber,
        Long purchaseRequestId,
        String requestNumber,
        String requesterName,
        String employeeId,
        String department,
        String category,
        BigDecimal estimatedAmount,
        String priority,
        Long purchaseOrderId,
        String poNumber,
        Long grnId,
        String grnNumber,
        Long invoiceId,
        String invoiceNumber,
        Long paymentId,
        String paymentNumber,
        AuditStatus status,
        AuditRiskLevel riskLevel,
        String assignedTo,
        String assignedBy,
        LocalDate assignedDate,
        LocalDate dueDate,
        String auditSummary,
        String conclusion,
        String recommendation,
        String concludedBy,
        LocalDateTime concludedAt,
        LocalDateTime createdAt
) {
}
