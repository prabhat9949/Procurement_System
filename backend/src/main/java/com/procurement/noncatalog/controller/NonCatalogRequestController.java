package com.procurement.noncatalog.controller;

import com.procurement.common.response.ApiResponse;
import com.procurement.common.response.PageResponse;
import com.procurement.noncatalog.dto.request.NonCatalogCreateRequest;
import com.procurement.noncatalog.dto.request.NonCatalogReviewRequest;
import com.procurement.noncatalog.dto.response.NonCatalogResponse;
import com.procurement.noncatalog.service.NonCatalogRequestService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/non-catalog-requests")
public class NonCatalogRequestController {

    private final NonCatalogRequestService ncrService;

    public NonCatalogRequestController(NonCatalogRequestService ncrService) {
        this.ncrService = ncrService;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CAN_CREATE_PR')")
    public ResponseEntity<ApiResponse<NonCatalogResponse>> create(
            @Valid @RequestBody NonCatalogCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Non-catalog request submitted for HR review", ncrService.create(request)));
    }

    @GetMapping("/{id}")
    public ApiResponse<NonCatalogResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(ncrService.getById(id));
    }

    @GetMapping
    public ApiResponse<PageResponse<NonCatalogResponse>> search(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long requesterId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String direction) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(direction), sort));
        return ApiResponse.success(ncrService.search(status, departmentId, requesterId, pageable));
    }

    @GetMapping("/my-requests")
    public ApiResponse<PageResponse<NonCatalogResponse>> getMyRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(ncrService.getMyRequests(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))));
    }

    @GetMapping("/pending-hr")
    public ApiResponse<PageResponse<NonCatalogResponse>> getPendingHr(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(ncrService.getPendingHrReview(PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "createdAt"))));
    }

    @GetMapping("/pending-procurement")
    public ApiResponse<PageResponse<NonCatalogResponse>> getPendingProcurement(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(ncrService.getPendingProcurementReview(PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "createdAt"))));
    }

    @PostMapping("/{id}/hr-review")
    public ApiResponse<NonCatalogResponse> reviewByHr(
            @PathVariable Long id,
            @Valid @RequestBody NonCatalogReviewRequest request) {
        return ApiResponse.success("HR review updated", ncrService.reviewByHr(id, request));
    }

    @PostMapping("/{id}/procurement-process")
    @PreAuthorize("hasAnyAuthority('CAN_MANAGE_PRODUCTS','SUPER_ADMIN','ADMIN','PROCUREMENT_MANAGER','PROCUREMENT_OFFICER')")
    public ApiResponse<NonCatalogResponse> processByProcurement(
            @PathVariable Long id,
            @Valid @RequestBody NonCatalogReviewRequest request) {
        return ApiResponse.success("Procurement classification completed", ncrService.processByProcurement(id, request));
    }
}
