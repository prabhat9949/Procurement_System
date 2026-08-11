package com.procurement.purchaserequest.controller;

import com.procurement.common.response.ApiResponse;
import com.procurement.common.response.PageResponse;
import com.procurement.purchaserequest.dto.request.PurchaseRequestRequest;
import com.procurement.purchaserequest.dto.response.PurchaseRequestResponse;
import com.procurement.purchaserequest.entity.ApprovalStatus;
import com.procurement.purchaserequest.entity.PurchaseRequestPriority;
import com.procurement.purchaserequest.entity.PurchaseRequestStatus;
import com.procurement.purchaserequest.service.PurchaseRequestService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/purchase-requests")
public class PurchaseRequestController {

    private final PurchaseRequestService purchaseRequestService;

    public PurchaseRequestController(PurchaseRequestService purchaseRequestService) {
        this.purchaseRequestService = purchaseRequestService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PurchaseRequestResponse>> create(
            @Valid @RequestBody PurchaseRequestRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                "Purchase request created", purchaseRequestService.create(request)));
    }

    @GetMapping
    public ApiResponse<PageResponse<PurchaseRequestResponse>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long requesterId,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long costCenterId,
            @RequestParam(required = false) PurchaseRequestPriority priority,
            @RequestParam(required = false) PurchaseRequestStatus status,
            @RequestParam(required = false) ApprovalStatus approvalStatus,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate requiredDateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate requiredDateTo,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate createdDateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate createdDateTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String direction) {
        Pageable pageable = PageRequest.of(page, size,
                Sort.by(Sort.Direction.fromString(direction), sort));
        return ApiResponse.success(purchaseRequestService.search(keyword, requesterId, departmentId,
                costCenterId, priority, status, approvalStatus, requiredDateFrom, requiredDateTo,
                createdDateFrom, createdDateTo, pageable));
    }

    @GetMapping("/search")
    public ApiResponse<PageResponse<PurchaseRequestResponse>> searchEndpoint(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long requesterId,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long costCenterId,
            @RequestParam(required = false) PurchaseRequestPriority priority,
            @RequestParam(required = false) PurchaseRequestStatus status,
            @RequestParam(required = false) ApprovalStatus approvalStatus,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate requiredDateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate requiredDateTo,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate createdDateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate createdDateTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String direction) {
        return search(keyword, requesterId, departmentId, costCenterId, priority, status,
                approvalStatus, requiredDateFrom, requiredDateTo, createdDateFrom, createdDateTo,
                page, size, sort, direction);
    }

    @GetMapping("/{id}")
    public ApiResponse<PurchaseRequestResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(purchaseRequestService.getById(id));
    }

    @PutMapping("/{id}")
    public ApiResponse<PurchaseRequestResponse> update(@PathVariable Long id,
                                                       @Valid @RequestBody PurchaseRequestRequest request) {
        return ApiResponse.success("Purchase request updated",
                purchaseRequestService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        purchaseRequestService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/submit")
    public ApiResponse<PurchaseRequestResponse> submit(@PathVariable Long id) {
        return ApiResponse.success("Purchase request submitted", purchaseRequestService.submit(id));
    }

    @PostMapping("/{id}/cancel")
    public ApiResponse<PurchaseRequestResponse> cancel(@PathVariable Long id) {
        return ApiResponse.success("Purchase request cancelled", purchaseRequestService.cancel(id));
    }
}
