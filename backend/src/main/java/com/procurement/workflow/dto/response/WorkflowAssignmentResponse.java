package com.procurement.workflow.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Enriched workflow assignment: carries the full assignee identity plus a
 * summary of the underlying record (for PR assignments) so dashboards can
 * render information-dense queue cards without extra round-trips.
 */
public record WorkflowAssignmentResponse(
        Long id,
        String assignmentNumber,
        String entityType,
        Long entityId,
        String stage,
        Long assignedEmployeeId,
        String assignedEmployeeName,
        String employeeCode,
        String assignedRoleCode,
        String assignedRoleName,
        Long assignedById,
        String assignedByName,
        String status,
        String action,
        String reason,
        Long previousAssignmentId,
        LocalDateTime assignedAt,
        LocalDateTime completedAt,
        // Enrichment for PR assignments
        Long purchaseRequestId,
        String requestNumber,
        String requesterName,
        String departmentName,
        String categoryName,
        BigDecimal amount,
        String priority,
        LocalDateTime requiredDate) {
}
