package com.procurement.auditlog.controller;

import com.procurement.auditlog.dto.response.*;
import com.procurement.auditlog.service.AuditLogService;
import com.procurement.common.response.*;
import org.springframework.data.domain.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/audit-logs")
@PreAuthorize("hasAnyRole('ADMIN','AUDITOR','COMPLIANCE_OFFICER')")
public class AuditLogController {
    private final AuditLogService service;

    public AuditLogController(AuditLogService service) {
        this.service = service;
    }

    @GetMapping
    public ApiResponse<PageResponse<AuditLogResponse>> list(@RequestParam(required = false) String moduleName,
                                                            @RequestParam(required = false) String entityName,
                                                            @RequestParam(required = false) String operation,
                                                            @RequestParam(required = false) Long userId,
                                                            @RequestParam(required = false) LocalDate startDate,
                                                            @RequestParam(required = false) LocalDate endDate,
                                                            @RequestParam(required = false) Boolean success,
                                                            @RequestParam(required = false) String referenceNumber,
                                                            @RequestParam(defaultValue = "0") int page,
                                                            @RequestParam(defaultValue = "20") int size,
                                                            @RequestParam(defaultValue = "performedAt") String sort,
                                                            @RequestParam(defaultValue = "desc") String direction) {
        return ApiResponse.success(service.search(moduleName, entityName, operation, userId, startDate, endDate, success, referenceNumber, pageable(page, size, sort, direction)));
    }

    @GetMapping("/search")
    public ApiResponse<PageResponse<AuditLogResponse>> search(@RequestParam(required = false) String moduleName,
                                                              @RequestParam(required = false) String entityName,
                                                              @RequestParam(required = false) String operation,
                                                              @RequestParam(required = false) Long userId,
                                                              @RequestParam(required = false) LocalDate startDate,
                                                              @RequestParam(required = false) LocalDate endDate,
                                                              @RequestParam(required = false) Boolean success,
                                                              @RequestParam(required = false) String referenceNumber,
                                                              @RequestParam(defaultValue = "0") int page,
                                                              @RequestParam(defaultValue = "20") int size,
                                                              @RequestParam(defaultValue = "performedAt") String sort,
                                                              @RequestParam(defaultValue = "desc") String direction) {
        return ApiResponse.success(service.search(moduleName, entityName, operation, userId, startDate, endDate, success, referenceNumber, pageable(page, size, sort, direction)));
    }

    @GetMapping("/{id}")
    public ApiResponse<AuditLogResponse> get(@PathVariable Long id) {
        return ApiResponse.success(service.get(id));
    }

    @GetMapping("/export")
    public ApiResponse<AuditLogExportResponse> export(@RequestParam(required = false) String moduleName,
                                                      @RequestParam(required = false) String entityName,
                                                      @RequestParam(required = false) String operation,
                                                      @RequestParam(required = false) Long userId,
                                                      @RequestParam(required = false) LocalDate startDate,
                                                      @RequestParam(required = false) LocalDate endDate,
                                                      @RequestParam(required = false) Boolean success,
                                                      @RequestParam(required = false) String referenceNumber) {
        return ApiResponse.success(service.export(moduleName, entityName, operation, userId, startDate, endDate, success, referenceNumber));
    }

    private Pageable pageable(int page, int size, String sort, String direction) {
        return PageRequest.of(page, size, "asc".equalsIgnoreCase(direction) ? Sort.by(sort).ascending() : Sort.by(sort).descending());
    }
}
