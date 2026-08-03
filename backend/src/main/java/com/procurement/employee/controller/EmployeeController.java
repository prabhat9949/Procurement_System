package com.procurement.employee.controller;

import com.procurement.common.response.ApiResponse;
import com.procurement.common.response.PageResponse;
import com.procurement.employee.dto.request.EmployeeRequest;
import com.procurement.employee.dto.response.EmployeeResponse;
import com.procurement.employee.service.EmployeeService;
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

@RestController
@RequestMapping("/api/employees")
@Tag(name = "Employee", description = "HR and Admin employee management APIs")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','HR_MANAGER')")
    @Operation(summary = "Create employee", description = "Creates an employee record. The backend generates employeeCode automatically.")
    public ResponseEntity<ApiResponse<EmployeeResponse>> create(
            @Valid @RequestBody EmployeeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Employee created successfully", employeeService.create(request)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','HR_MANAGER')")
    @Operation(summary = "Search employees", description = "Returns paginated employees with filtering, sorting, and keyword search.")
    public ApiResponse<PageResponse<EmployeeResponse>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long costCenterId,
            @RequestParam(required = false) Long roleId,
            @RequestParam(required = false) Long managerId,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String direction) {
        Pageable pageable = PageRequest.of(page, size,
                Sort.by(Sort.Direction.fromString(direction), sort));
        return ApiResponse.success(employeeService.search(keyword, departmentId, costCenterId,
                roleId, managerId, active, pageable));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','HR_MANAGER')")
    @Operation(summary = "Search employees", description = "Alias for the employee search endpoint.")
    public ApiResponse<PageResponse<EmployeeResponse>> searchEndpoint(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long costCenterId,
            @RequestParam(required = false) Long roleId,
            @RequestParam(required = false) Long managerId,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String direction) {
        return search(keyword, departmentId, costCenterId, roleId, managerId, active, page,
                size, sort, direction);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','HR_MANAGER')")
    @Operation(summary = "Get employee by id")
    public ApiResponse<EmployeeResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(employeeService.getById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','HR_MANAGER')")
    @Operation(summary = "Update employee")
    public ApiResponse<EmployeeResponse> update(@PathVariable Long id,
                                                @Valid @RequestBody EmployeeRequest request) {
        return ApiResponse.success("Employee updated", employeeService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
    @Operation(summary = "Delete employee", description = "Deletes an employee only when no user account is linked.")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        employeeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
