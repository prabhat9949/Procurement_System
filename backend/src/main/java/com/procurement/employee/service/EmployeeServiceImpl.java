package com.procurement.employee.service;

import com.procurement.common.exception.BadRequestException;
import com.procurement.common.exception.ConflictException;
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

    public EmployeeServiceImpl(EmployeeRepository employeeRepository,
                               DepartmentRepository departmentRepository,
                               CostCenterRepository costCenterRepository,
                               RoleRepository roleRepository,
                               UserRepository userRepository,
                               EmployeeMapper employeeMapper,
                               EmployeeValidator employeeValidator) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.costCenterRepository = costCenterRepository;
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.employeeMapper = employeeMapper;
        this.employeeValidator = employeeValidator;
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
    @Transactional
    public EmployeeResponse update(Long id, EmployeeRequest request) {
        employeeValidator.validate(request);
        Employee employee = findEmployee(id);
        ensureUnique(request.email(), request.phone(), id);
        Department department = findDepartment(request.departmentId());
        CostCenter costCenter = findCostCenter(request.costCenterId());
        ensureDepartmentMatchesCostCenter(department, costCenter);
        Role role = findRole(request.roleId());
        Employee manager = findManager(request.managerId(), id);
        employeeMapper.updateEntity(employee, request, department, costCenter, role, manager);
        return employeeMapper.toResponse(employeeRepository.save(employee));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Employee employee = findEmployee(id);
        if (userRepository.findByEmployee(employee).isPresent()) {
            throw new ConflictException("Employee has a linked user account and cannot be deleted");
        }
        employeeRepository.delete(employee);
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

    private String temporaryEmployeeCode() {
        return "TMP-" + UUID.randomUUID();
    }

    private String finalEmployeeCode(Long id) {
        String employeeCode = "EMP" + String.format("%06d", id);
        if (employeeRepository.existsByEmployeeCode(employeeCode)) {
            throw new ConflictException("Generated employee code already exists");
        }
        return employeeCode;
    }
}
