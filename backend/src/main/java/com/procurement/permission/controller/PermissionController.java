package com.procurement.permission.controller;

import com.procurement.common.response.ApiResponse;
import com.procurement.common.response.PageResponse;
import com.procurement.permission.dto.response.PermissionResponse;
import com.procurement.permission.service.PermissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/permissions")
@Tag(name = "Permission", description = "Permission master data used for RBAC")
@PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','HR_MANAGER')")
public class PermissionController {

    private final PermissionService permissionService;

    public PermissionController(PermissionService permissionService) {
        this.permissionService = permissionService;
    }

    @GetMapping("/all")
    @Operation(summary = "List all permissions (for role permission checklists)")
    public ApiResponse<List<PermissionResponse>> listAll() {
        return ApiResponse.success(permissionService.listAll());
    }

    @GetMapping
    @Operation(summary = "Search permissions")
    public ApiResponse<PageResponse<PermissionResponse>> search(
            @RequestParam(required = false) String moduleName,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(defaultValue = "moduleName") String sort,
            @RequestParam(defaultValue = "asc") String direction) {
        Pageable pageable = PageRequest.of(page, size,
                Sort.by(Sort.Direction.fromString(direction), sort));
        return ApiResponse.success(permissionService.search(moduleName, active, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get permission by id")
    public ApiResponse<PermissionResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(permissionService.getById(id));
    }
}
