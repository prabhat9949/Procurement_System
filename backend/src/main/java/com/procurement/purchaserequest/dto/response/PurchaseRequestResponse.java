package com.procurement.purchaserequest.dto.response;

import com.procurement.purchaserequest.entity.ApprovalStatus;
import com.procurement.purchaserequest.entity.PurchaseRequestPriority;
import com.procurement.purchaserequest.entity.PurchaseRequestStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record PurchaseRequestResponse(
        Long id,
        String requestNumber,
        LocalDate requestDate,
        LocalDate requiredDate,
        Long requesterId,
        String requesterName,
        Long departmentId,
        String departmentName,
        Long costCenterId,
        String costCenterName,
        PurchaseRequestPriority priority,
        PurchaseRequestStatus status,
        ApprovalStatus approvalStatus,
        String purpose,
        String remarks,
        BigDecimal estimatedAmount,
        String createdBy,
        String updatedBy,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
}
