package com.procurement.audit.controller;

import com.procurement.audit.dto.request.AuditCaseRequest;
import com.procurement.audit.dto.request.AuditConclusionRequest;
import com.procurement.audit.dto.request.AuditFindingRequest;
import com.procurement.audit.dto.request.AuditFindingStatusRequest;
import com.procurement.audit.dto.response.AuditCaseResponse;
import com.procurement.audit.dto.response.AuditFindingResponse;
import com.procurement.audit.entity.AuditStatus;
import com.procurement.audit.service.AuditService;
import com.procurement.common.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/audits")
public class AuditController {

    private final AuditService service;

    public AuditController(AuditService service) {
        this.service = service;
    }

    private PageRequest page(int p, int s, String sort, String dir) {
        return PageRequest.of(p, s, Sort.by(Sort.Direction.fromString(dir), sort));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CREATE_AUDIT_CASE')")
    public ResponseEntity<ApiResponse<AuditCaseResponse>> create(@Valid @RequestBody AuditCaseRequest request, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Audit case created", service.createCase(request, auth.getName())));
    }

    @GetMapping("/my-queue")
    @PreAuthorize("hasAuthority('VIEW_AUDIT_CASES')")
    public ApiResponse<Page<AuditCaseResponse>> myQueue(
            @RequestParam(required = false) AuditStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String direction,
            Authentication auth) {
        return ApiResponse.success(service.myCases(auth.getName(), status, page(page, size, sort, direction)));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('VIEW_AUDIT_TEAM_QUEUE')")
    public ApiResponse<Page<AuditCaseResponse>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) AuditStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String direction) {
        return ApiResponse.success(service.search(keyword, status, page(page, size, sort, direction)));
    }

    @GetMapping("/pending-count")
    @PreAuthorize("hasAuthority('VIEW_AUDIT_CASES')")
    public ApiResponse<Long> pendingCount(Authentication auth) {
        return ApiResponse.success(service.pendingCount(auth.getName()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('VIEW_AUDIT_CASES')")
    public ApiResponse<AuditCaseResponse> get(@PathVariable Long id, Authentication auth) {
        return ApiResponse.success(service.getCase(id, auth.getName()));
    }

    @GetMapping("/{id}/findings")
    @PreAuthorize("hasAuthority('VIEW_AUDIT_CASES')")
    public ApiResponse<Page<AuditFindingResponse>> findings(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(service.findings(id, page(page, size, "createdAt", "desc")));
    }

    @PostMapping("/{id}/findings")
    @PreAuthorize("hasAuthority('CREATE_AUDIT_FINDING')")
    public ResponseEntity<ApiResponse<AuditFindingResponse>> addFinding(
            @PathVariable Long id, @Valid @RequestBody AuditFindingRequest request, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Finding recorded", service.addFinding(id, request, auth.getName())));
    }

    @PostMapping("/{id}/findings/{findingId}/status")
    @PreAuthorize("hasAuthority('CLOSE_FINDING')")
    public ApiResponse<AuditFindingResponse> updateFindingStatus(
            @PathVariable Long id, @PathVariable Long findingId,
            @Valid @RequestBody AuditFindingStatusRequest request, Authentication auth) {
        return ApiResponse.success("Finding status updated", service.updateFindingStatus(id, findingId, request, auth.getName()));
    }

    @PostMapping("/{id}/conclude")
    @PreAuthorize("hasAuthority('CONCLUDE_AUDIT')")
    public ApiResponse<AuditCaseResponse> conclude(
            @PathVariable Long id, @Valid @RequestBody AuditConclusionRequest request, Authentication auth) {
        return ApiResponse.success("Audit concluded", service.conclude(id, request, auth.getName()));
    }
}
