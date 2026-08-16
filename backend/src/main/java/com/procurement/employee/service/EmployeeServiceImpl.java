package com.procurement.employee.service;

import com.procurement.auditlog.service.AuditLogService;
import com.procurement.common.exception.BadRequestException;
import com.procurement.common.exception.ConflictException;
import com.procurement.common.exception.ForbiddenException;
import com.procurement.common.exception.ResourceNotFoundException;
import com.procurement.common.response.PageResponse;
import com.procurement.costcenter.entity.CostCenter;
import com.procurement.costcenter.repository.CostCenterRepository;
import com.procurement.department.entity.Department;
import com.procurement.department.repository.DepartmentRepository;
import com.procurement.employee.dto.request.EmployeeRequest;
import com.procurement.employee.dto.response.EmployeeResponse;
import com.procurement.employee.entity.Employee;
import com.procurement.employee.exception.EmployeeNotFoundException;
import com.procurement.employee.mapper.EmployeeMapper;
import com.procurement.employee.repository.EmployeeRepository;
import com.procurement.employee.specification.EmployeeSpecification;
import com.procurement.employee.validator.EmployeeValidator;
import com.procurement.role.entity.Role;
import com.procurement.role.repository.RoleRepository;
import com.procurement.user.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;
import java.util.UUID;

@Service
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final CostCenterRepository costCenterRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final EmployeeMapper employeeMapper;
    private final EmployeeValidator employeeValidator;
    private final AuditLogService auditLogService;
    private final com.procurement.workflow.service.RoleChangeTaskService roleChangeTaskService;

    public EmployeeServiceImpl(EmployeeRepository employeeRepository,
                               DepartmentRepository departmentRepository,
                               CostCenterRepository costCenterRepository,
                               RoleRepository roleRepository,
                               UserRepository userRepository,
                               EmployeeMapper employeeMapper,
                               EmployeeValidator employeeValidator,
                               AuditLogService auditLogService,
                               com.procurement.workflow.service.RoleChangeTaskService roleChangeTaskService) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.costCenterRepository = costCenterRepository;
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.employeeMapper = employeeMapper;
        this.employeeValidator = employeeValidator;
        this.auditLogService = auditLogService;
        this.roleChangeTaskService = roleChangeTaskService;
    }

    @Override
    @Transactional
    public EmployeeResponse create(EmployeeRequest request) {
        employeeValidator.validate(request);
        ensureUnique(request.email(), request.phone(), null);
        Department department = findDepartment(request.departmentId());
        CostCenter costCenter = findCostCenter(request.costCenterId());
        ensureDepartmentMatchesCostCenter(department, costCenter);
        Role role = findRole(request.roleId());
        Employee manager = findManager(request.managerId(), null);

        Employee employee = employeeMapper.toEntity(request, department, costCenter, role, manager);
        employee.setEmployeeCode(temporaryEmployeeCode());
        Employee saved = employeeRepository.save(employee);
        saved.setEmployeeCode(finalEmployeeCode(saved.getId()));
        saved = employeeRepository.save(saved);
        auditLogService.record("Employee", "Employee", saved.getId(), "CREATE",
                saved.getEmployeeCode(), "EMPLOYEE", true, null,
                employeeDetails(saved), "Employee record created by HR/Admin");
        return employeeMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<EmployeeResponse> search(String keyword, Long departmentId, Long costCenterId,
                                                 Long roleId, Long managerId, Boolean active,
                                                 Pageable pageable) {
        Page<EmployeeResponse> page = employeeRepository.findAll(
                        EmployeeSpecification.search(keyword, departmentId, costCenterId, roleId,
                                managerId, active), pageable)
                .map(employeeMapper::toResponse);
        return new PageResponse<>(page.getContent(), page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages(), page.isLast());
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeResponse getById(Long id) {
        return employeeMapper.toResponse(findEmployee(id));
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeResponse myProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ForbiddenException("Authentication required");
        }
        return userRepository.findByUsername(authentication.getName())
                .map(user -> user.getEmployee())
                .map(employeeMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No employee record is linked to the authenticated user"));
    }

    @Override
    @Transactional
    public EmployeeResponse update(Long id, EmployeeRequest request) {
        employeeValidator.validate(request);
        Employee employee = findEmployee(id);
        String old = employeeDetails(employee);
        Boolean oldActive = employee.getActive();
        ensureUnique(request.email(), request.phone(), id);
        Department department = findDepartment(request.departmentId());
        CostCenter costCenter = findCostCenter(request.costCenterId());
        ensureDepartmentMatchesCostCenter(department, costCenter);
        Role role = findRole(request.roleId());
        Role oldRole = employee.getRole();
        Employee manager = findManager(request.managerId(), id);
        employeeMapper.updateEntity(employee, request, department, costCenter, role, manager);
        Employee saved = employeeRepository.save(employee);

        // Keep the linked account's role in sync so the change reflects on next
        // login, and safely handle any open tasks assigned to this employee
        // (retain where the new role is still authorised, reassign otherwise).
        if (oldRole == null || !oldRole.getId().equals(role.getId())) {
            final Role newRole = role;
            userRepository.findByEmployee(saved).ifPresent(user -> {
                user.setRole(newRole);
                userRepository.save(user);
            });
            roleChangeTaskService.handleRoleChange(saved.getId(), oldRole == null ? role : oldRole, newRole,
                    "Role changed via employee update (HR/Admin)");
        }

        // Employment status drives linked account access: an active employee has an
        // enabled account, a deactivated employee loses login access in the same transaction.
        if (request.active() != null && (oldActive == null || !oldActive.equals(request.active()))) {
            final boolean active = Boolean.TRUE.equals(request.active());
            userRepository.findByEmployee(saved).ifPresent(user -> {
                if (Boolean.TRUE.equals(user.getEnabled()) != active) {
                    user.setEnabled(active);
                    userRepository.save(user);
                }
            });
        }

        String operation = "UPDATE";
        if (oldActive != null && request.active() != null && !oldActive.equals(request.active())) {
            operation = Boolean.TRUE.equals(request.active()) ? "ACTIVATE" : "DEACTIVATE";
        }
        auditLogService.record("Employee", "Employee", saved.getId(), operation,
                saved.getEmployeeCode(), "EMPLOYEE", true, old,
                employeeDetails(saved), "Employee record updated by HR/Admin");
        return employeeMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Employee employee = findEmployee(id);
        if (userRepository.findByEmployee(employee).isPresent()) {
            throw new ConflictException("Employee has a linked user account and cannot be deleted");
        }
        String old = employeeDetails(employee);
        employeeRepository.delete(employee);
        auditLogService.record("Employee", "Employee", id, "DELETE",
                employee.getEmployeeCode(), "EMPLOYEE", true, old, null,
                "Employee record deleted");
    }

    private Employee findEmployee(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new EmployeeNotFoundException(id));
    }

    private Department findDepartment(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + id));
    }

    private CostCenter findCostCenter(Long id) {
        return costCenterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cost center not found: " + id));
    }

    private Role findRole(Long id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + id));
    }

    private Employee findManager(Long managerId, Long currentEmployeeId) {
        if (managerId == null) {
            return null;
        }
        if (Objects.equals(managerId, currentEmployeeId)) {
            throw new BadRequestException("Employee cannot be their own manager");
        }
        return findEmployee(managerId);
    }

    private void ensureUnique(String email, String phone, Long currentId) {
        employeeRepository.findByEmail(email).ifPresent(existing -> {
            if (!existing.getId().equals(currentId)) {
                throw new ConflictException("Employee email is already in use");
            }
        });
        if (phone != null && !phone.isBlank()) {
            employeeRepository.findByPhone(phone).ifPresent(existing -> {
                if (!existing.getId().equals(currentId)) {
                    throw new ConflictException("Employee phone is already in use");
                }
            });
        }
    }

    private void ensureDepartmentMatchesCostCenter(Department department, CostCenter costCenter) {
        if (!costCenter.getDepartment().getId().equals(department.getId())) {
            throw new BadRequestException("Cost center does not belong to the selected department");
        }
    }

    private String employeeDetails(Employee employee) {
        return "{code=" + employee.getEmployeeCode()
                + ", name=" + employee.getFirstName() + " " + employee.getLastName()
                + ", dept=" + (employee.getDepartment() == null ? "null" : employee.getDepartment().getDepartmentName())
                + ", role=" + (employee.getRole() == null ? "null" : employee.getRole().getRoleCode())
                + ", active=" + employee.getActive() + "}";
    }

    private String temporaryEmployeeCode() {
        // Must fit the employee_code column (length 30): "TMP-" + 12 hex chars.
        return "TMP-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    }

    private String finalEmployeeCode(Long id) {
        String employeeCode = "EMP" + String.format("%06d", id);
        if (employeeRepository.existsByEmployeeCode(employeeCode)) {
            throw new ConflictException("Generated employee code already exists");
        }
        return employeeCode;
    }
}
