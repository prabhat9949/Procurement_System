package com.procurement.costcenter.service;

import com.procurement.auditlog.service.AuditLogService;
import com.procurement.common.exception.ConflictException;
import com.procurement.common.exception.ResourceNotFoundException;
import com.procurement.common.response.PageResponse;
import com.procurement.costcenter.dto.request.CostCenterRequest;
import com.procurement.costcenter.dto.response.CostCenterResponse;
import com.procurement.costcenter.entity.CostCenter;
import com.procurement.costcenter.repository.CostCenterRepository;
import com.procurement.department.entity.Department;
import com.procurement.department.repository.DepartmentRepository;
import com.procurement.employee.repository.EmployeeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class CostCenterService {

    private final CostCenterRepository costCenterRepository;
    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;
    private final AuditLogService auditLogService;

    public CostCenterService(CostCenterRepository costCenterRepository,
                             DepartmentRepository departmentRepository,
                             EmployeeRepository employeeRepository,
                             AuditLogService auditLogService) {
        this.costCenterRepository = costCenterRepository;
        this.departmentRepository = departmentRepository;
        this.employeeRepository = employeeRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public CostCenterResponse create(CostCenterRequest request) {
        if (costCenterRepository.existsByCode(request.code())) {
            throw new ConflictException("Cost center code is already registered: " + request.code());
        }
        Department department = findDepartment(request.departmentId());
        CostCenter costCenter = new CostCenter();
        costCenter.setCode(request.code().trim().toUpperCase());
        costCenter.setName(request.name().trim());
        costCenter.setDepartment(department);
        costCenter.setActive(request.active() == null || request.active());
        BigDecimal budget = request.budget() == null ? BigDecimal.ZERO : request.budget();
        costCenter.setBudget(budget);
        costCenter.setUsedBudget(BigDecimal.ZERO);
        costCenter.setRemainingBudget(budget);
        CostCenter saved = costCenterRepository.save(costCenter);
        auditLogService.record("CostCenter", "CostCenter", saved.getId(), "CREATE",
                saved.getCode(), "COST_CENTER", true, null, ccDetails(saved),
                "Cost center created by admin");
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<CostCenterResponse> search(String keyword, Long departmentId, Boolean active, Pageable pageable) {
        org.springframework.data.jpa.domain.Specification<CostCenter> spec = (root, query, cb) -> {
            var predicates = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();
            if (keyword != null && !keyword.isBlank()) {
                String like = "%" + keyword.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("code")), like),
                        cb.like(cb.lower(root.get("name")), like)
                ));
            }
            if (departmentId != null) {
                predicates.add(cb.equal(root.get("department").get("id"), departmentId));
            }
            if (active != null) {
                predicates.add(cb.equal(root.get("active"), active));
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
        Page<CostCenterResponse> page = costCenterRepository.findAll(spec, pageable).map(this::toResponse);
        return new PageResponse<>(page.getContent(), page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages(), page.isLast());
    }

    @Transactional(readOnly = true)
    public List<CostCenterResponse> listAll() {
        return costCenterRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<CostCenterResponse> listByDepartment(Long departmentId) {
        return costCenterRepository.findByDepartmentId(departmentId).stream()
                .map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public CostCenterResponse getById(Long id) {
        return toResponse(find(id));
    }

    @Transactional
    public CostCenterResponse update(Long id, CostCenterRequest request) {
        CostCenter costCenter = find(id);
        String old = ccDetails(costCenter);
        if (request.code() != null && !request.code().isBlank()
                && !costCenter.getCode().equalsIgnoreCase(request.code())
                && costCenterRepository.existsByCode(request.code())) {
            throw new ConflictException("Cost center code is already registered: " + request.code());
        }
        if (request.code() != null && !request.code().isBlank()) {
            costCenter.setCode(request.code().trim().toUpperCase());
        }
        if (request.name() != null && !request.name().isBlank()) {
            costCenter.setName(request.name().trim());
        }
        if (request.departmentId() != null) {
            costCenter.setDepartment(findDepartment(request.departmentId()));
        }
        if (request.active() != null) {
            costCenter.setActive(request.active());
        }
        if (request.budget() != null && request.budget().compareTo(costCenter.getBudget()) != 0) {
            // Adjust the budget: keep used budget, recompute remaining. Full
            // BudgetTransaction history is handled where the model supports it.
            BigDecimal newBudget = request.budget();
            BigDecimal delta = newBudget.subtract(costCenter.getBudget());
            costCenter.setBudget(newBudget);
            costCenter.setRemainingBudget(costCenter.getRemainingBudget().add(delta));
        }
        CostCenter saved = costCenterRepository.save(costCenter);
        auditLogService.record("CostCenter", "CostCenter", saved.getId(), "UPDATE",
                saved.getCode(), "COST_CENTER", true, old, ccDetails(saved),
                "Cost center updated by admin");
        return toResponse(saved);
    }

    @Transactional
    public void delete(Long id) {
        CostCenter costCenter = find(id);
        long employees = employeeRepository.countByCostCenterId(id);
        if (employees > 0) {
            throw new ConflictException("Cost center is assigned to " + employees
                    + " employee(s); deactivate instead of deleting");
        }
        costCenterRepository.delete(costCenter);
        auditLogService.record("CostCenter", "CostCenter", id, "DELETE",
                costCenter.getCode(), "COST_CENTER", true, ccDetails(costCenter), null,
                "Cost center deleted by admin");
    }

    private CostCenter find(Long id) {
        return costCenterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cost center not found: " + id));
    }

    private Department findDepartment(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + id));
    }

    private CostCenterResponse toResponse(CostCenter cc) {
        return new CostCenterResponse(cc.getId(), cc.getCode(), cc.getName(),
                cc.getDepartment().getId(), cc.getDepartment().getDepartmentCode(),
                cc.getDepartment().getDepartmentName(),
                cc.getBudget(), cc.getUsedBudget(), cc.getRemainingBudget(), cc.getActive(),
                employeeRepository.countByCostCenterId(cc.getId()),
                cc.getCreatedAt(), cc.getUpdatedAt());
    }

    private String ccDetails(CostCenter cc) {
        return "{code=" + cc.getCode() + ", name=" + cc.getName()
                + ", budget=" + cc.getBudget() + ", remaining=" + cc.getRemainingBudget()
                + ", active=" + cc.getActive() + "}";
    }
}
