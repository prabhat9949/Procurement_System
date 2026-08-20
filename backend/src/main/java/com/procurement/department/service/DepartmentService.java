package com.procurement.department.service;

import com.procurement.auditlog.service.AuditLogService;
import com.procurement.common.exception.ConflictException;
import com.procurement.common.exception.ResourceNotFoundException;
import com.procurement.common.response.PageResponse;
import com.procurement.costcenter.repository.CostCenterRepository;
import com.procurement.department.dto.request.DepartmentRequest;
import com.procurement.department.dto.response.DepartmentResponse;
import com.procurement.department.entity.Department;
import com.procurement.department.repository.DepartmentRepository;
import com.procurement.employee.repository.EmployeeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;
    private final CostCenterRepository costCenterRepository;
    private final AuditLogService auditLogService;

    public DepartmentService(DepartmentRepository departmentRepository,
                             EmployeeRepository employeeRepository,
                             CostCenterRepository costCenterRepository,
                             AuditLogService auditLogService) {
        this.departmentRepository = departmentRepository;
        this.employeeRepository = employeeRepository;
        this.costCenterRepository = costCenterRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public DepartmentResponse create(DepartmentRequest request) {
        if (departmentRepository.existsByDepartmentCode(request.departmentCode())) {
            throw new ConflictException("Department code is already registered: " + request.departmentCode());
        }
        if (departmentRepository.existsByDepartmentName(request.departmentName())) {
            throw new ConflictException("Department name is already registered: " + request.departmentName());
        }
        Department department = new Department();
        department.setDepartmentCode(request.departmentCode().trim().toUpperCase());
        department.setDepartmentName(request.departmentName().trim());
        department.setDescription(request.description());
        department.setActive(request.active() == null || request.active());
        Department saved = departmentRepository.save(department);
        auditLogService.record("Department", "Department", saved.getId(), "CREATE",
                saved.getDepartmentCode(), "DEPARTMENT", true, null,
                deptDetails(saved), "Department created by admin");
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<DepartmentResponse> search(String keyword, Boolean active, Pageable pageable) {
        org.springframework.data.jpa.domain.Specification<Department> spec = (root, query, cb) -> {
            var predicates = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();
            if (keyword != null && !keyword.isBlank()) {
                String like = "%" + keyword.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("departmentCode")), like),
                        cb.like(cb.lower(root.get("departmentName")), like)
                ));
            }
            if (active != null) {
                predicates.add(cb.equal(root.get("active"), active));
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
        Page<DepartmentResponse> page = departmentRepository.findAll(spec, pageable).map(this::toResponse);
        return new PageResponse<>(page.getContent(), page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages(), page.isLast());
    }

    @Transactional(readOnly = true)
    public List<DepartmentResponse> listAll() {
        return departmentRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public DepartmentResponse getById(Long id) {
        return toResponse(find(id));
    }

    @Transactional
    public DepartmentResponse update(Long id, DepartmentRequest request) {
        Department department = find(id);
        String old = deptDetails(department);
        if (request.departmentCode() != null && !request.departmentCode().isBlank()
                && !department.getDepartmentCode().equalsIgnoreCase(request.departmentCode())
                && departmentRepository.existsByDepartmentCode(request.departmentCode())) {
            throw new ConflictException("Department code is already registered: " + request.departmentCode());
        }
        if (request.departmentName() != null && !request.departmentName().isBlank()
                && !department.getDepartmentName().equalsIgnoreCase(request.departmentName())
                && departmentRepository.existsByDepartmentName(request.departmentName())) {
            throw new ConflictException("Department name is already registered: " + request.departmentName());
        }
        if (request.departmentCode() != null && !request.departmentCode().isBlank()) {
            department.setDepartmentCode(request.departmentCode().trim().toUpperCase());
        }
        if (request.departmentName() != null && !request.departmentName().isBlank()) {
            department.setDepartmentName(request.departmentName().trim());
        }
        department.setDescription(request.description());
        if (request.active() != null) {
            department.setActive(request.active());
        }
        Department saved = departmentRepository.save(department);
        auditLogService.record("Department", "Department", saved.getId(), "UPDATE",
                saved.getDepartmentCode(), "DEPARTMENT", true, old, deptDetails(saved),
                "Department updated by admin");
        return toResponse(saved);
    }

    @Transactional
    public void delete(Long id) {
        Department department = find(id);
        long employees = employeeRepository.countByDepartmentId(id);
        long costCenters = costCenterRepository.countByDepartmentId(id);
        if (employees > 0 || costCenters > 0) {
            throw new ConflictException("Department has " + employees + " employee(s) and "
                    + costCenters + " cost center(s); deactivate instead of deleting");
        }
        departmentRepository.delete(department);
        auditLogService.record("Department", "Department", id, "DELETE",
                department.getDepartmentCode(), "DEPARTMENT", true, deptDetails(department), null,
                "Department deleted by admin");
    }

    private Department find(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + id));
    }

    private DepartmentResponse toResponse(Department department) {
        return new DepartmentResponse(department.getId(), department.getDepartmentCode(),
                department.getDepartmentName(), department.getDescription(), department.getActive(),
                employeeRepository.countByDepartmentId(department.getId()),
                costCenterRepository.countByDepartmentId(department.getId()),
                department.getCreatedAt(), department.getUpdatedAt());
    }

    private String deptDetails(Department d) {
        return "{code=" + d.getDepartmentCode() + ", name=" + d.getDepartmentName()
                + ", active=" + d.getActive() + "}";
    }
}
