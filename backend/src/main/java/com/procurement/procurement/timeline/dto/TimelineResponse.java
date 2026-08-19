package com.procurement.procurement.timeline.dto;

import java.util.List;

/**
 * Unified PR timeline: current state plus the full merged event history.
 */
public record TimelineResponse(
        Long purchaseRequestId,
        String requestNumber,
        String requesterName,
        String departmentName,
        String currentStatus,
        String currentApprovalStatus,
        String currentStage,
        String currentAssigneeName,
        String currentAssigneeRole,
        List<TimelineEvent> events) {
}
