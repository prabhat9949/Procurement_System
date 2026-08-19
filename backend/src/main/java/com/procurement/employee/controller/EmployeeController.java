package com.procurement.employee.controller;

import com.procurement.common.exception.ForbiddenException;
import com.procurement.common.response.ApiResponse;
import com.procurement.common.response.PageResponse;
import com.procurement.employee.dto.request.EmployeeRequest;
import com.procurement.employee.dto.response.EmployeeResponse;
import com.procurement.employee.entity.Employee;
import com.procurement.employee.repository.EmployeeRepository;
import com.procurement.employee.service.EmployeeService;
import com.procurement.role.entity.Role;
import com.procurement.role.repository.RoleRepository;
import com.procurement.user.entity.User;
import com.procurement.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employees")
@Tag(name = "Employee", description = "HR and Admin employee management APIs")
public class EmployeeController {

    private final EmployeeService employeeService;
    private final EmployeeRepository employeeRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;

    public EmployeeController(EmployeeService employeeService,
                              EmployeeRepository employeeRepository,
                              RoleRepository roleRepository,
                              UserRepository userRepository) {
        this.employeeService = employeeService;
        this.employeeRepository = employeeRepository;
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
    }

    /** True when the authenticated actor is HR (not a system admin). */
    private boolean isHrActor(Authentication authentication) {
        if (authentication == null) return false;
        return authentication.getAuthorities().stream()
                .anyMatch(a -> "ROLE_HR_MANAGER".equals(a.getAuthority()));
    }

    private boolean isAdminRoleCode(String roleCode) {
        return "ADMIN".equals(roleCode) || "SUPER_ADMIN".equals(roleCode);
    }

    /** HR may not create an employee with (or edit one into) the ADMIN role. */
    private void assertNotAdminRole(Long roleId, Authentication authentication) {
        if (!isHrActor(authentication) || roleId == null) return;
        roleRepository.findById(roleId)
                .filter(role -> isAdminRoleCode(role.getRoleCode()))
                .ifPresent(role -> {
                    throw new ForbiddenException(
                            "Only administrators can create or assign the ADMIN role");
                });
    }

    /** HR may not edit an employee record linked to an ADMIN / SUPER_ADMIN account. */
    private void assertEmployeeNotAdmin(Long employeeId, Authentication authentication) {
        if (!isHrActor(authentication)) return;
        boolean adminLinked = userRepository.findAll().stream()
                .filter(user -> user.getEmployee() != null
                        && employeeId.equals(user.getEmployee().getId()))
                .anyMatch(user -> isAdminRoleCode(user.getRole().getRoleCode()));
        boolean adminRoleOnRecord = employeeRepository.findById(employeeId)
                .map(Employee::getRole)
                .map(Role::getRoleCode)
                .map(this::isAdminRoleCode)
                .orElse(false);
        if (adminLinked || adminRoleOnRecord) {
            throw new ForbiddenException(
                    "Administrator records are protected and cannot be modified by HR");
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
    @Operation(summary = "Create employee", description = "Creates an employee record. The backend generates employeeCode automatically.")
    public ResponseEntity<ApiResponse<EmployeeResponse>> create(
            @Valid @RequestBody EmployeeRequest request,
            Authentication authentication) {
        assertNotAdminRole(request.roleId(), authentication);
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

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get my employee profile", description = "Returns the employee record linked to the authenticated user.")
    public ApiResponse<EmployeeResponse> myProfile() {
        return ApiResponse.success(employeeService.myProfile());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','HR_MANAGER')")
    @Operation(summary = "Get employee by id")
    public ApiResponse<EmployeeResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(employeeService.getById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
    @Operation(summary = "Update employee")
    public ApiResponse<EmployeeResponse> update(@PathVariable Long id,
                                                @Valid @RequestBody EmployeeRequest request,
                                                Authentication authentication) {
        assertEmployeeNotAdmin(id, authentication);
        assertNotAdminRole(request.roleId(), authentication);
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
