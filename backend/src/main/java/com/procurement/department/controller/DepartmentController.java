package com.procurement.department.controller;

import com.procurement.common.response.ApiResponse;
import com.procurement.common.response.PageResponse;
import com.procurement.department.dto.request.DepartmentRequest;
import com.procurement.department.dto.response.DepartmentResponse;
import com.procurement.department.service.DepartmentService;
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
@RequestMapping("/api/departments")
@Tag(name = "Department", description = "Department master data")
@PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','HR_MANAGER')")
public class DepartmentController {

    private final DepartmentService departmentService;

    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    @PostMapping
    @Operation(summary = "Create department")
    public ResponseEntity<ApiResponse<DepartmentResponse>> create(@Valid @RequestBody DepartmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Department created successfully", departmentService.create(request)));
    }

    @GetMapping
    @Operation(summary = "Search departments")
    public ApiResponse<PageResponse<DepartmentResponse>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(defaultValue = "departmentName") String sort,
            @RequestParam(defaultValue = "asc") String direction) {
        Pageable pageable = PageRequest.of(page, size,
                Sort.by(Sort.Direction.fromString(direction), sort));
        return ApiResponse.success(departmentService.search(keyword, active, pageable));
    }

    @GetMapping("/all")
    @Operation(summary = "List all departments (for dropdowns)")
    public ApiResponse<List<DepartmentResponse>> listAll() {
        return ApiResponse.success(departmentService.listAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get department by id")
    public ApiResponse<DepartmentResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(departmentService.getById(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update department")
    public ApiResponse<DepartmentResponse> update(@PathVariable Long id,
                                                  @Valid @RequestBody DepartmentRequest request) {
        return ApiResponse.success("Department updated", departmentService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete department", description = "Only allowed when no employees or cost centers reference it")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        departmentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
