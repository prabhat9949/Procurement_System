package com.procurement.approvaltask.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Enriched approval-queue row for the logged-in approver (Senior Manager / Head
 * / Department Manager). Joins the approval task with its purchase request so
 * the dashboard can show who requested it, why it reached this stage, what
 * happens next and whether it is overdue — all derived from database records.
 */
public record ApprovalTaskQueueResponse(
        Long id,
        String taskNumber,
        Long purchaseRequestId,
        String requestNumber,
        Long approvalStageId,
        String stageName,
        String status,
        LocalDateTime assignedDate,
        LocalDateTime completedDate,
        BigDecimal approvedAmount,
        Long requesterId,
        String requesterName,
        String employeeCode,
        Long departmentId,
        String departmentName,
        String category,
        String priority,
        String purpose,
        LocalDateTime createdAt,
        LocalDate requiredDate,
        String previousApprover,
        String previousApproval,
        String approvalReason,
        String nextStageName,
        String nextApproverRole,
        boolean overdue,
        long pendingDays) {
}
