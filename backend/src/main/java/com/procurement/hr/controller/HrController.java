package com.procurement.hr.controller;

import com.procurement.common.response.ApiResponse;
import com.procurement.common.response.PageResponse;
import com.procurement.hr.dto.response.HrApprovalHistoryResponse;
import com.procurement.hr.dto.response.HrPrDetailResponse;
import com.procurement.hr.dto.response.HrPrRowResponse;
import com.procurement.hr.dto.response.HrTimelineEventResponse;
import com.procurement.hr.service.HrService;
import com.procurement.purchaserequest.entity.ApprovalStatus;
import com.procurement.purchaserequest.entity.PurchaseRequestPriority;
import com.procurement.purchaserequest.entity.PurchaseRequestStatus;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * HR procurement-monitoring APIs. HR is a read-only monitoring role: it can
 * view employee purchase requests within its scope (permission-gated) but has
 * no workflow-mutation endpoints here. Every endpoint re-checks the effective
 * permission from the database on each request.
 */
@RestController
@RequestMapping("/api/hr")
@PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','HR_MANAGER')")
public class HrController {

    private final HrService hrService;

    public HrController(HrService hrService) {
        this.hrService = hrService;
    }

    @GetMapping("/purchase-requests")
    @PreAuthorize("hasAuthority('CAN_VIEW_ACTIVE_PRS')")
    public ApiResponse<PageResponse<HrPrRowResponse>> activePurchaseRequests(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long requesterId,
            @RequestParam(required = false) PurchaseRequestPriority priority,
            @RequestParam(required = false) PurchaseRequestStatus status,
            @RequestParam(required = false) ApprovalStatus approvalStatus,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate createdDateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate createdDateTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String direction) {
        Pageable pageable = PageRequest.of(page, size,
                Sort.by(Sort.Direction.fromString(direction), sort));
        return ApiResponse.success(hrService.activePurchaseRequests(keyword, departmentId,
                requesterId, priority, status, approvalStatus, createdDateFrom, createdDateTo,
                pageable));
    }

    @GetMapping("/purchase-requests/{id}")
    @PreAuthorize("hasAuthority('CAN_VIEW_ACTIVE_PRS')")
    public ApiResponse<HrPrDetailResponse> purchaseRequestDetail(@PathVariable Long id) {
        return ApiResponse.success(hrService.purchaseRequestDetail(id));
    }

    @GetMapping("/purchase-requests/{id}/approval-history")
    @PreAuthorize("hasAuthority('CAN_VIEW_APPROVAL_HISTORY')")
    public ApiResponse<List<HrApprovalHistoryResponse>> approvalHistory(@PathVariable Long id) {
        return ApiResponse.success(hrService.approvalHistory(id));
    }

    @GetMapping("/purchase-requests/{id}/timeline")
    @PreAuthorize("hasAuthority('CAN_VIEW_PR_TIMELINE')")
    public ApiResponse<List<HrTimelineEventResponse>> timeline(@PathVariable Long id) {
        return ApiResponse.success(hrService.timeline(id));
    }
}
