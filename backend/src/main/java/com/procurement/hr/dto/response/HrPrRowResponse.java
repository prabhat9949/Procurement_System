package com.procurement.hr.dto.response;

import com.procurement.purchaserequest.entity.ApprovalStatus;
import com.procurement.purchaserequest.entity.PurchaseRequestPriority;
import com.procurement.purchaserequest.entity.PurchaseRequestStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * One row of the HR "active purchase requests" monitoring table. Every value
 * comes from the live database; the current owner / stage are derived from the
 * workflow's pending approval task when one exists.
 */
public record HrPrRowResponse(
        Long id,
        String requestNumber,
        Long requesterId,
        String requesterName,
        String employeeCode,
        String departmentName,
        String costCenterName,
        String purpose,
        BigDecimal estimatedAmount,
        PurchaseRequestPriority priority,
        PurchaseRequestStatus status,
        ApprovalStatus approvalStatus,
        String currentStage,
        String currentOwner,
        String nextAction,
        int ageDays,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
