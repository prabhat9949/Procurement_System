package com.procurement.hr.service;

import com.procurement.common.response.PageResponse;
import com.procurement.hr.dto.response.HrApprovalHistoryResponse;
import com.procurement.hr.dto.response.HrPrDetailResponse;
import com.procurement.hr.dto.response.HrPrRowResponse;
import com.procurement.hr.dto.response.HrTimelineEventResponse;
import com.procurement.purchaserequest.entity.ApprovalStatus;
import com.procurement.purchaserequest.entity.PurchaseRequestPriority;
import com.procurement.purchaserequest.entity.PurchaseRequestStatus;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

/**
 * HR procurement-monitoring service. HR is a read-only monitoring role: it can
 * see employee purchase requests within its authorized scope but never mutates
 * the workflow. Scope is enforced here from the authenticated user.
 */
public interface HrService {

    /**
     * Active (in-progress) purchase requests visible to the HR user.
     * Scope: all employees when the user holds CAN_VIEW_ALL_EMPLOYEE_PR,
     * otherwise restricted to the HR user's own department.
     */
    PageResponse<HrPrRowResponse> activePurchaseRequests(
            String keyword,
            Long departmentId,
            Long requesterId,
            PurchaseRequestPriority priority,
            PurchaseRequestStatus status,
            ApprovalStatus approvalStatus,
            LocalDate createdDateFrom,
            LocalDate createdDateTo,
            Pageable pageable);

    /** Full detail of one purchase request within HR scope. */
    HrPrDetailResponse purchaseRequestDetail(Long id);

    /** Approval chain (who approved, when, comments) for one purchase request. */
    List<HrApprovalHistoryResponse> approvalHistory(Long purchaseRequestId);

    /** Full lifecycle timeline for one purchase request. */
    List<HrTimelineEventResponse> timeline(Long purchaseRequestId);
}
