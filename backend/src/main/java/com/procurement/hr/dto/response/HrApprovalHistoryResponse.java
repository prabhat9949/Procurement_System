package com.procurement.hr.dto.response;

import java.time.LocalDateTime;

/**
 * One approval decision in the HR approval-history view. Answers "who approved
 * this PR, when, and what did they say" — sourced from the real approval tasks.
 */
public record HrApprovalHistoryResponse(
        Long taskId,
        String taskNumber,
        String stageName,
        String approverName,
        String approverEmployeeCode,
        String approverRole,
        String status,
        String comments,
        LocalDateTime assignedDate,
        LocalDateTime completedDate
) {
}
