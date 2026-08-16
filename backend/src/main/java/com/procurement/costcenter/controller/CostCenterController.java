package com.procurement.costcenter.controller;

import com.procurement.common.response.ApiResponse;
import com.procurement.common.response.PageResponse;
import com.procurement.costcenter.dto.request.CostCenterRequest;
import com.procurement.costcenter.dto.response.CostCenterResponse;
import com.procurement.costcenter.service.CostCenterService;
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
@RequestMapping("/api/cost-centers")
@Tag(name = "Cost Center", description = "Cost center master data with budgets")
@PreAuthorize("isAuthenticated()")
public class CostCenterController {

    private final CostCenterService costCenterService;

    public CostCenterController(CostCenterService costCenterService) {
        this.costCenterService = costCenterService;
    }

    @PostMapping
    @Operation(summary = "Create cost center")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','HR_MANAGER')")
    public ResponseEntity<ApiResponse<CostCenterResponse>> create(@Valid @RequestBody CostCenterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Cost center created successfully", costCenterService.create(request)));
    }

    @GetMapping
    @Operation(summary = "Search cost centers")
    public ApiResponse<PageResponse<CostCenterResponse>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(defaultValue = "name") String sort,
            @RequestParam(defaultValue = "asc") String direction) {
        Pageable pageable = PageRequest.of(page, size,
                Sort.by(Sort.Direction.fromString(direction), sort));
        return ApiResponse.success(costCenterService.search(keyword, departmentId, active, pageable));
    }

    @GetMapping("/all")
    @Operation(summary = "List all cost centers (for dropdowns)")
    public ApiResponse<List<CostCenterResponse>> listAll() {
        return ApiResponse.success(costCenterService.listAll());
    }

    @GetMapping("/by-department/{departmentId}")
    @Operation(summary = "List cost centers for a department (dependent dropdown)")
    public ApiResponse<List<CostCenterResponse>> listByDepartment(@PathVariable Long departmentId) {
        return ApiResponse.success(costCenterService.listByDepartment(departmentId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get cost center by id")
    public ApiResponse<CostCenterResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(costCenterService.getById(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update cost center")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','HR_MANAGER')")
    public ApiResponse<CostCenterResponse> update(@PathVariable Long id,
                                                  @Valid @RequestBody CostCenterRequest request) {
        return ApiResponse.success("Cost center updated", costCenterService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete cost center", description = "Only allowed when no employees reference it")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','HR_MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        costCenterService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
