package com.procurement.user.controller;

import com.procurement.auditlog.service.AuditLogService;
import com.procurement.common.exception.ConflictException;
import com.procurement.common.exception.ResourceNotFoundException;
import com.procurement.common.response.ApiResponse;
import com.procurement.costcenter.entity.CostCenter;
import com.procurement.costcenter.repository.CostCenterRepository;
import com.procurement.department.entity.Department;
import com.procurement.department.repository.DepartmentRepository;
import com.procurement.employee.entity.Employee;
import com.procurement.employee.repository.EmployeeRepository;
import com.procurement.role.entity.Role;
import com.procurement.role.repository.RoleRepository;
import com.procurement.user.dto.request.AdminUserCreateRequest;
import com.procurement.user.dto.request.AdminUserCredentialUpdateRequest;
import com.procurement.user.dto.request.AdminUserUpdateRequest;
import com.procurement.user.dto.request.UserPermissionItem;
import com.procurement.user.dto.response.EffectivePermissionResponse;
import com.procurement.user.dto.response.UserAccountResponse;
import com.procurement.user.dto.response.UserPermissionOverrideResponse;
import com.procurement.common.exception.ForbiddenException;
import com.procurement.user.entity.User;
import com.procurement.user.repository.UserRepository;
import com.procurement.user.service.UserPermissionService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','HR_MANAGER')")
public class UserAdminController {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final RoleRepository roleRepository;
    private final DepartmentRepository departmentRepository;
    private final CostCenterRepository costCenterRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;
    private final UserPermissionService userPermissionService;
    private final com.procurement.workflow.service.RoleChangeTaskService roleChangeTaskService;

    public UserAdminController(UserRepository userRepository,
                               EmployeeRepository employeeRepository,
                               RoleRepository roleRepository,
                               DepartmentRepository departmentRepository,
                               CostCenterRepository costCenterRepository,
                               PasswordEncoder passwordEncoder,
                               AuditLogService auditLogService,
                               UserPermissionService userPermissionService,
                               com.procurement.workflow.service.RoleChangeTaskService roleChangeTaskService) {
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
        this.roleRepository = roleRepository;
        this.departmentRepository = departmentRepository;
        this.costCenterRepository = costCenterRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
        this.userPermissionService = userPermissionService;
        this.roleChangeTaskService = roleChangeTaskService;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public ApiResponse<List<UserAccountResponse>> listUsers() {
        return ApiResponse.success(userRepository.findAll().stream()
                .map(this::toResponse)
                .toList());
    }

    @GetMapping("/search")
    @Transactional(readOnly = true)
    public ApiResponse<Page<UserAccountResponse>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long roleId,
            @RequestParam(required = false) Boolean enabled,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String direction) {
        Pageable pageable = PageRequest.of(page, size,
                Sort.by(Sort.Direction.fromString(direction), sort));
        org.springframework.data.jpa.domain.Specification<User> spec = (root, query, cb) -> {
            var predicates = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();
            if (keyword != null && !keyword.isBlank()) {
                String like = "%" + keyword.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("username")), like),
                        cb.like(cb.lower(root.get("employee").get("firstName")), like),
                        cb.like(cb.lower(root.get("employee").get("lastName")), like),
                        cb.like(cb.lower(root.get("employee").get("email")), like),
                        cb.like(cb.lower(root.get("employee").get("employeeCode")), like)
                ));
            }
            if (roleId != null) {
                predicates.add(cb.equal(root.get("role").get("id"), roleId));
            }
            if (enabled != null) {
                predicates.add(cb.equal(root.get("enabled"), enabled));
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
        Page<UserAccountResponse> users = userRepository.findAll(spec, pageable).map(this::toResponse);
        return ApiResponse.success(users);
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ApiResponse<UserAccountResponse> getUser(@PathVariable Long id) {
        return ApiResponse.success(toResponse(findUser(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
    @Transactional
    public ResponseEntity<ApiResponse<UserAccountResponse>> createUser(
            @Valid @RequestBody AdminUserCreateRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new ConflictException("Username is already registered");
        }
        if (employeeRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email is already registered to another employee");
        }
        Role role = findRole(request.roleId());
        Department department = findDepartment(request.departmentId());
        CostCenter costCenter = findCostCenter(request.costCenterId());

        String employeeCode = request.employeeCode() == null || request.employeeCode().isBlank()
                ? nextEmployeeCode()
                : request.employeeCode().trim().toUpperCase();
        if (employeeRepository.existsByEmployeeCode(employeeCode)) {
            throw new ConflictException("Employee code is already registered: " + employeeCode);
        }

        Employee employee = Employee.builder()
                .employeeCode(employeeCode)
                .firstName(request.firstName().trim())
                .lastName(request.lastName().trim())
                .email(request.email().trim().toLowerCase())
                .phone(request.phone())
                .department(department)
                .costCenter(costCenter)
                .role(role)
                .active(true)
                .build();
        if (request.managerId() != null) {
            employee.setManager(findEmployee(request.managerId()));
        }
        employee = employeeRepository.save(employee);

        User user = User.builder()
                .username(request.username().trim())
                .password(passwordEncoder.encode(request.password()))
                .plainPassword(request.password())
                .employee(employee)
                .role(role)
                .enabled(request.enabled() == null || request.enabled())
                .accountLocked(false)
                .build();
        User saved = userRepository.save(user);

        auditLogService.record("User", "User", saved.getId(), "CREATE",
                saved.getUsername(), "USER", true, null, userDetails(saved),
                "User account created by admin");
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User created successfully", toResponse(saved)));
    }

    @PutMapping("/{id}")
    @Transactional
    public ApiResponse<UserAccountResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody AdminUserUpdateRequest request,
            Authentication authentication) {
        User user = findUser(id);
        assertNotProtectedAdmin(user, authentication);
        String old = userDetails(user);
        Role oldRole = user.getRole();
        Role newRole = null;

        if (request.username() != null && !request.username().isBlank()
                && !request.username().equalsIgnoreCase(user.getUsername())
                && userRepository.existsByUsername(request.username())) {
            throw new ConflictException("Username is already registered");
        }
        if (request.username() != null && !request.username().isBlank()) {
            user.setUsername(request.username().trim());
        }
        if (request.newPassword() != null && !request.newPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.newPassword()));
            user.setPlainPassword(request.newPassword());
        }
        if (request.enabled() != null) {
            user.setEnabled(request.enabled());
        }
        if (request.accountLocked() != null) {
            user.setAccountLocked(request.accountLocked());
        }
        if (request.roleId() != null) {
            String currentRoleCode = user.getRole().getRoleCode();
            newRole = findRole(request.roleId());
            assertCanAssignRole(authentication, newRole);
            boolean leavingAdmin = "ADMIN".equals(currentRoleCode) || "SUPER_ADMIN".equals(currentRoleCode);
            boolean notAdminAnymore = !"ADMIN".equals(newRole.getRoleCode()) && !"SUPER_ADMIN".equals(newRole.getRoleCode());
            if (leavingAdmin && notAdminAnymore && countActiveAdminsExcluding(user.getId()) == 0) {
                throw new ConflictException(
                        "This action would leave the system without an active administrator.");
            }
            user.setRole(newRole);
            user.getEmployee().setRole(user.getRole());
        }

        Employee employee = user.getEmployee();
        if (request.firstName() != null && !request.firstName().isBlank()) {
            employee.setFirstName(request.firstName().trim());
        }
        if (request.lastName() != null && !request.lastName().isBlank()) {
            employee.setLastName(request.lastName().trim());
        }
        if (request.email() != null && !request.email().isBlank()
                && !request.email().equalsIgnoreCase(employee.getEmail())
                && employeeRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email is already registered to another employee");
        }
        if (request.email() != null && !request.email().isBlank()) {
            employee.setEmail(request.email().trim().toLowerCase());
        }
        if (request.phone() != null) {
            employee.setPhone(request.phone());
        }
        if (request.departmentId() != null) {
            employee.setDepartment(findDepartment(request.departmentId()));
        }
        if (request.costCenterId() != null) {
            employee.setCostCenter(findCostCenter(request.costCenterId()));
        }
        if (request.managerId() != null) {
            employee.setManager(findEmployee(request.managerId()));
        }

        employeeRepository.save(employee);
        User saved = userRepository.save(user);

        auditLogService.record("User", "User", saved.getId(), "UPDATE",
                saved.getUsername(), "USER", true, old, userDetails(saved),
                "User account updated by admin");

        // Role change with open tasks: never delete them — retain where the new
        // role is still authorised, otherwise reassign to a configured replacement.
        // Every decision is audited and both parties notified.
        if (newRole != null && !newRole.getId().equals(oldRole.getId())) {
            roleChangeTaskService.handleRoleChange(saved.getEmployee().getId(), oldRole, newRole,
                    "Role changed by " + authentication.getName());
        }
        return ApiResponse.success("User updated successfully", toResponse(saved));
    }

    @PutMapping("/{id}/credentials")
    @Transactional
    public ApiResponse<UserAccountResponse> updateCredentials(
            @PathVariable Long id,
            @Valid @RequestBody AdminUserCredentialUpdateRequest request,
            Authentication authentication) {
        User user = findUser(id);
        assertNotProtectedAdmin(user, authentication);
        String old = userDetails(user);

        if (request.username() != null && !request.username().isBlank()
                && !request.username().equalsIgnoreCase(user.getUsername())
                && userRepository.existsByUsername(request.username())) {
            throw new ConflictException("Username is already registered");
        }
        if (request.username() != null && !request.username().isBlank()) {
            user.setUsername(request.username().trim());
        }
        if (request.newPassword() != null && !request.newPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.newPassword()));
            user.setPlainPassword(request.newPassword());
        }
        if (request.enabled() != null) {
            user.setEnabled(request.enabled());
        }
        if (request.accountLocked() != null) {
            user.setAccountLocked(request.accountLocked());
        }
        User saved = userRepository.save(user);

        auditLogService.record("User", "User", saved.getId(), "CREDENTIALS_UPDATED",
                saved.getUsername(), "USER", true, old, userDetails(saved),
                "User credentials updated by admin");
        return ApiResponse.success("User credentials updated successfully", toResponse(saved));
    }

    @PutMapping("/{id}/status")
    @Transactional
    public ApiResponse<UserAccountResponse> setStatus(@PathVariable Long id,
                                                      @RequestBody StatusRequest request,
                                                      Authentication authentication) {
        User user = findUser(id);
        assertNotProtectedAdmin(user, authentication);
        String old = "{enabled=" + user.getEnabled() + ", locked=" + user.getAccountLocked() + "}";
        if (request.enabled() != null) {
            user.setEnabled(request.enabled());
        }
        if (request.accountLocked() != null) {
            user.setAccountLocked(request.accountLocked());
        }
        User saved = userRepository.save(user);
        auditLogService.record("User", "User", saved.getId(),
                Boolean.TRUE.equals(request.enabled()) ? "ACTIVATE"
                        : Boolean.FALSE.equals(request.enabled()) ? "DEACTIVATE" : "STATUS_UPDATED",
                saved.getUsername(), "USER", true, old,
                "{enabled=" + saved.getEnabled() + ", locked=" + saved.getAccountLocked() + "}",
                "User account status changed by admin");
        return ApiResponse.success("User status updated", toResponse(saved));
    }

    // ===================== User-specific permission overrides =====================

    @GetMapping("/{id}/effective-permissions")
    @Transactional(readOnly = true)
    public ApiResponse<List<EffectivePermissionResponse>> effectivePermissions(@PathVariable Long id) {
        return ApiResponse.success(userPermissionService.effectivePermissions(id));
    }

    @GetMapping("/{id}/permission-overrides")
    @Transactional(readOnly = true)
    public ApiResponse<List<UserPermissionOverrideResponse>> permissionOverrides(@PathVariable Long id) {
        return ApiResponse.success(userPermissionService.getOverrides(id));
    }

    @PutMapping("/{id}/permission-overrides")
    @Transactional
    public ApiResponse<List<EffectivePermissionResponse>> savePermissionOverrides(
            @PathVariable Long id,
            @Valid @RequestBody List<UserPermissionItem> items,
            Authentication authentication) {
        User user = findUser(id);
        assertNotProtectedAdmin(user, authentication);
        String actor = authentication == null ? "admin" : authentication.getName();
        return ApiResponse.success("User permissions updated",
                userPermissionService.saveOverrides(id, items, actor));
    }

    // ===================== Admin protection (HR cannot touch admins) =====================

    /** True when the authenticated actor is HR (not a system admin). */
    private boolean isHrActor(Authentication authentication) {
        if (authentication == null) return false;
        return authentication.getAuthorities().stream()
                .anyMatch(a -> "ROLE_HR_MANAGER".equals(a.getAuthority()));
    }

    private boolean isAdminRoleCode(String roleCode) {
        return "ADMIN".equals(roleCode) || "SUPER_ADMIN".equals(roleCode);
    }

    /** HR may never modify an ADMIN / SUPER_ADMIN account (status, role, password, overrides). */
    private void assertNotProtectedAdmin(User user, Authentication authentication) {
        if (isHrActor(authentication) && isAdminRoleCode(user.getRole().getRoleCode())) {
            throw new ForbiddenException(
                    "Administrator accounts are protected and cannot be modified by HR");
        }
    }

    /** HR may never assign (or reassign) the ADMIN / SUPER_ADMIN role to anyone. */
    private void assertCanAssignRole(Authentication authentication, Role role) {
        if (isHrActor(authentication) && isAdminRoleCode(role.getRoleCode())) {
            throw new ForbiddenException(
                    "Only administrators can assign the ADMIN role");
        }
    }

    // ===================== Helpers =====================

    private long countActiveAdminsExcluding(Long userId) {
        List<User> admins = new java.util.ArrayList<>();
        roleRepository.findByRoleCode("ADMIN").ifPresent(r -> admins.addAll(userRepository.findByRoleId(r.getId())));
        roleRepository.findByRoleCode("SUPER_ADMIN").ifPresent(r -> admins.addAll(userRepository.findByRoleId(r.getId())));
        return admins.stream()
                .filter(u -> !u.getId().equals(userId))
                .filter(u -> Boolean.TRUE.equals(u.getEnabled()))
                .filter(u -> !Boolean.TRUE.equals(u.getAccountLocked()))
                .count();
    }

    private User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Employee findEmployee(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + id));
    }

    private Role findRole(Long id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + id));
    }

    private Department findDepartment(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + id));
    }

    private CostCenter findCostCenter(Long id) {
        return costCenterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cost center not found: " + id));
    }

    private String nextEmployeeCode() {
        long count = employeeRepository.count();
        return "EMP" + String.format("%04d", count + 1);
    }

    private UserAccountResponse toResponse(User user) {
        Employee employee = user.getEmployee();
        return new UserAccountResponse(
                user.getId(),
                user.getUsername(),
                user.getPlainPassword(),
                user.getEnabled(),
                user.getAccountLocked(),
                user.getRole().getRoleCode(),
                user.getRole().getRoleName(),
                user.getRole().getId(),
                employee.getId(),
                employee.getEmployeeCode(),
                employee.getFirstName() + " " + employee.getLastName(),
                employee.getEmail(),
                employee.getPhone(),
                employee.getDepartment() == null ? null : employee.getDepartment().getId(),
                employee.getDepartment() == null ? null : employee.getDepartment().getDepartmentName(),
                employee.getCostCenter() == null ? null : employee.getCostCenter().getId(),
                employee.getCostCenter() == null ? null : employee.getCostCenter().getName(),
                employee.getManager() == null ? null : employee.getManager().getId(),
                employee.getManager() == null ? null
                        : employee.getManager().getFirstName() + " " + employee.getManager().getLastName(),
                user.getLastLogin(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }

    private String userDetails(User user) {
        return "{username=" + user.getUsername() + ", role=" + user.getRole().getRoleCode()
                + ", enabled=" + user.getEnabled() + ", locked=" + user.getAccountLocked() + "}";
    }

    public record StatusRequest(Boolean enabled, Boolean accountLocked) {
    }
}
