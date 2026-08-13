package com.procurement.role.controller;

import com.procurement.common.response.ApiResponse;
import com.procurement.common.response.PageResponse;
import com.procurement.role.dto.request.RoleRequest;
import com.procurement.role.dto.response.RoleResponse;
import com.procurement.role.service.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
@Tag(name = "Role", description = "Role management with permission assignment")
@PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
public class RoleController {

    private final RoleService roleService;

    public RoleController(RoleService roleService) {
        this.roleService = roleService;
    }

    @PostMapping
    @Operation(summary = "Create role")
    public ResponseEntity<ApiResponse<RoleResponse>> create(@Valid @RequestBody RoleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Role created successfully", roleService.create(request)));
    }

    @GetMapping
    @Operation(summary = "Search roles")
    public ApiResponse<PageResponse<RoleResponse>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(defaultValue = "roleName") String sort,
            @RequestParam(defaultValue = "asc") String direction) {
        Pageable pageable = PageRequest.of(page, size,
                Sort.by(Sort.Direction.fromString(direction), sort));
        return ApiResponse.success(roleService.search(keyword, active, pageable));
    }

    @GetMapping("/all")
    @Operation(summary = "List all roles (for user assignment dropdowns)")
    public ApiResponse<List<RoleResponse>> listAll() {
        return ApiResponse.success(roleService.listAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get role by id")
    public ApiResponse<RoleResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(roleService.getById(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update role")
    public ApiResponse<RoleResponse> update(@PathVariable Long id,
                                            @Valid @RequestBody RoleRequest request) {
        return ApiResponse.success("Role updated", roleService.update(id, request));
    }

    @PutMapping("/{id}/permissions")
    @Operation(summary = "Assign permissions to role")
    public ApiResponse<RoleResponse> setPermissions(@PathVariable Long id,
                                                    @RequestBody List<Long> permissionIds) {
        return ApiResponse.success("Role permissions updated", roleService.setPermissions(id, permissionIds));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete role", description = "System roles and roles with assigned users cannot be deleted")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        roleService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
