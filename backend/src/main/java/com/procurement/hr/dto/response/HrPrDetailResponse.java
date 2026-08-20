package com.procurement.hr.dto.response;

import com.procurement.purchaserequest.entity.ApprovalStatus;
import com.procurement.purchaserequest.entity.PurchaseRequestPriority;
import com.procurement.purchaserequest.entity.PurchaseRequestStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Full purchase-request detail for the HR monitoring drawer, including the
 * requester's organizational context and the approval chain so far.
 */
public record HrPrDetailResponse(
        Long id,
        String requestNumber,
        LocalDate requestDate,
        LocalDate requiredDate,
        Long requesterId,
        String requesterName,
        String employeeCode,
        String departmentName,
        String costCenterName,
        String managerName,
        PurchaseRequestPriority priority,
        PurchaseRequestStatus status,
        ApprovalStatus approvalStatus,
        String purpose,
        String remarks,
        BigDecimal estimatedAmount,
        String currentStage,
        String currentOwner,
        String nextAction,
        int ageDays,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<HrApprovalHistoryResponse> approvalHistory
) {
}
