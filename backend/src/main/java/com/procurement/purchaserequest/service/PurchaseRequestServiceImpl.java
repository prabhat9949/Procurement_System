package com.procurement.purchaserequest.service;

import com.procurement.common.exception.ConflictException;
import com.procurement.common.exception.ForbiddenException;
import com.procurement.common.exception.ResourceNotFoundException;
import com.procurement.common.response.PageResponse;
import com.procurement.costcenter.entity.CostCenter;
import com.procurement.costcenter.repository.CostCenterRepository;
import com.procurement.department.entity.Department;
import com.procurement.department.repository.DepartmentRepository;
import com.procurement.employee.entity.Employee;
import com.procurement.employee.repository.EmployeeRepository;
import com.procurement.event.BusinessEventPublisher;
import com.procurement.event.BusinessEventType;
import com.procurement.notification.entity.NotificationType;
import com.procurement.purchaserequest.dto.request.PurchaseRequestRequest;
import com.procurement.purchaserequest.dto.response.PurchaseRequestResponse;
import com.procurement.purchaserequest.entity.ApprovalStatus;
import com.procurement.purchaserequest.entity.PurchaseRequest;
import com.procurement.purchaserequest.entity.PurchaseRequestPriority;
import com.procurement.purchaserequest.entity.PurchaseRequestStatus;
import com.procurement.purchaserequest.exception.PurchaseRequestNotFoundException;
import com.procurement.purchaserequest.mapper.PurchaseRequestMapper;
import com.procurement.purchaserequest.repository.PurchaseRequestRepository;
import com.procurement.purchaserequestline.repository.PurchaseRequestLineRepository;
import com.procurement.purchaserequest.specification.PurchaseRequestSpecification;
import com.procurement.purchaserequest.validator.PurchaseRequestValidator;
import com.procurement.approvaltask.service.ApprovalTaskService;
import com.procurement.user.entity.User;
import com.procurement.user.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;

@Service
public class PurchaseRequestServiceImpl implements PurchaseRequestService {

    private final PurchaseRequestRepository purchaseRequestRepository;
    private final PurchaseRequestLineRepository purchaseRequestLineRepository;
    private final com.procurement.category.repository.CategoryRepository categoryRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final CostCenterRepository costCenterRepository;
    private final UserRepository userRepository;
    private final PurchaseRequestMapper purchaseRequestMapper;
    private final PurchaseRequestValidator purchaseRequestValidator;
    private final ApprovalTaskService approvalTaskService;
    private final BusinessEventPublisher eventPublisher;
    private final com.procurement.procurement.scope.service.ProcurementScopeService procurementScopeService;

    public PurchaseRequestServiceImpl(PurchaseRequestRepository purchaseRequestRepository,
                                      PurchaseRequestLineRepository purchaseRequestLineRepository,
                                      com.procurement.category.repository.CategoryRepository categoryRepository,
                                      EmployeeRepository employeeRepository,
                                      DepartmentRepository departmentRepository,
                                      CostCenterRepository costCenterRepository,
                                      UserRepository userRepository,
                                      PurchaseRequestMapper purchaseRequestMapper,
                                      PurchaseRequestValidator purchaseRequestValidator,
                                      ApprovalTaskService approvalTaskService,
                                      BusinessEventPublisher eventPublisher,
                                      com.procurement.procurement.scope.service.ProcurementScopeService procurementScopeService) {
        this.purchaseRequestRepository = purchaseRequestRepository;
        this.purchaseRequestLineRepository = purchaseRequestLineRepository;
        this.categoryRepository = categoryRepository;
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.costCenterRepository = costCenterRepository;
        this.userRepository = userRepository;
        this.purchaseRequestMapper = purchaseRequestMapper;
        this.purchaseRequestValidator = purchaseRequestValidator;
        this.approvalTaskService = approvalTaskService;
        this.eventPublisher = eventPublisher;
        this.procurementScopeService = procurementScopeService;
    }
    @Override
    @Transactional
    public PurchaseRequestResponse create(PurchaseRequestRequest request) {
        purchaseRequestValidator.validate(request);
        boolean employeeOnly = isEmployeeOnly();
        Employee requester = employeeOnly ? currentEmployee() : findEmployee(request.requesterId());
        Department department = employeeOnly ? requester.getDepartment() : findDepartment(request.departmentId());
        CostCenter costCenter = findCostCenter(request.costCenterId());
        if (employeeOnly) {
            ensureCostCenterInDepartment(department, costCenter);
        }
        PurchaseRequest entity = purchaseRequestMapper.toEntity(request, requester, department, costCenter);
        entity.setRequestNumber(generateRequestNumber());
        String username = currentUsername();
        entity.setCreatedBy(username);
        entity.setUpdatedBy(username);
        PurchaseRequest saved = purchaseRequestRepository.save(entity);
        eventPublisher.publish(
                BusinessEventType.PURCHASE_REQUEST_CREATED,
                "PurchaseRequest",
                "PurchaseRequest",
                saved.getId(),
                saved.getRequestNumber(),
                "Purchase request created",
                username,
                NotificationType.PURCHASE_REQUEST
        );
        return purchaseRequestMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PurchaseRequestResponse> search(String keyword, Long requesterId,
                                                        Long departmentId, Long costCenterId,
                                                        PurchaseRequestPriority priority,
                                                        PurchaseRequestStatus status,
                                                        ApprovalStatus approvalStatus,
                                                        LocalDate requiredDateFrom,
                                                        LocalDate requiredDateTo,
                                                        LocalDate createdDateFrom,
                                                        LocalDate createdDateTo,
                                                        Pageable pageable) {
        if (isEmployeeOnly()) {
            requesterId = currentEmployee().getId();
        }
        org.springframework.data.jpa.domain.Specification<PurchaseRequest> spec =
                PurchaseRequestSpecification.search(keyword, requesterId, departmentId,
                        costCenterId, priority, status, approvalStatus, requiredDateFrom,
                        requiredDateTo, createdDateFrom, createdDateTo);

        String role = currentRoleCode();
        List<Long> teamCatIds = getSpecializedTeamCategoryIds(role);
        if (!teamCatIds.isEmpty()) {
            var teamCatSpec = PurchaseRequestSpecification.categoryIn(teamCatIds);
            if (teamCatSpec != null) spec = spec.and(teamCatSpec);
        } else {
            var categorySpec = PurchaseRequestSpecification.categoryIn(procurementScopeService.myCategoryIds());
            if (categorySpec != null) spec = spec.and(categorySpec);
        }

        Page<PurchaseRequestResponse> page = purchaseRequestRepository.findAll(spec, pageable)
                .map(purchaseRequestMapper::toResponse);
        return new PageResponse<>(page.getContent(), page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages(), page.isLast());
    }

    @Override
    @Transactional(readOnly = true)
    public PurchaseRequestResponse getById(Long id) {
        PurchaseRequest entity = findRequest(id);
        checkSpecializedDomainAccess(entity);
        return purchaseRequestMapper.toResponse(entity);
    }

    @Override
    @Transactional
    public PurchaseRequestResponse update(Long id, PurchaseRequestRequest request) {
        purchaseRequestValidator.validate(request);
        PurchaseRequest entity = findRequest(id);
        ensureDraftAndOwner(entity);
        boolean employeeOnly = isEmployeeOnly();
        Employee requester = employeeOnly ? currentEmployee() : findEmployee(request.requesterId());
        Department department = employeeOnly ? requester.getDepartment() : findDepartment(request.departmentId());
        CostCenter costCenter = findCostCenter(request.costCenterId());
        if (employeeOnly) {
            ensureCostCenterInDepartment(department, costCenter);
        }
        purchaseRequestMapper.updateEntity(entity, request, requester, department, costCenter);
        entity.setUpdatedBy(currentUsername());
        return purchaseRequestMapper.toResponse(purchaseRequestRepository.save(entity));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        PurchaseRequest entity = findRequest(id);
        ensureDraftAndOwner(entity);
        purchaseRequestRepository.delete(entity);
    }

    @Override
    @Transactional
    public PurchaseRequestResponse submit(Long id) {
        PurchaseRequest entity = findRequest(id);
        ensureDraftAndOwner(entity);
        // Budget validation happens here, before the workflow is generated. A
        // request that was returned for correction has its budget released, so a
        // resubmission commits fresh; the budget_committed flag keeps this idempotent.
        if (!Boolean.TRUE.equals(entity.getBudgetCommitted())) {
            CostCenter costCenter = entity.getCostCenter();
            BigDecimal amount = entity.getEstimatedAmount();
            if (costCenter.getRemainingBudget() == null
                    || costCenter.getRemainingBudget().compareTo(amount) < 0) {
                throw new ConflictException("Insufficient budget on cost center "
                        + costCenter.getCode() + " (remaining "
                        + (costCenter.getRemainingBudget() == null ? "0" : costCenter.getRemainingBudget())
                        + "). Please contact Finance or use a different cost center.");
            }
            commitBudget(costCenter, amount);
            entity.setBudgetCommitted(true);
        }
        approvalTaskService.submit(entity);
        eventPublisher.publish(
                BusinessEventType.PURCHASE_REQUEST_SUBMITTED,
                "PurchaseRequest",
                "PurchaseRequest",
                entity.getId(),
                entity.getRequestNumber(),
                "Purchase request submitted for approval",
                currentUsername(),
                NotificationType.APPROVAL
        );
        return purchaseRequestMapper.toResponse(entity);
    }

    @Override
    @Transactional
    public PurchaseRequestResponse cancel(Long id) {
        PurchaseRequest entity = findRequest(id);
        String username = currentUsername();
        if (!"system".equals(entity.getCreatedBy()) && !entity.getCreatedBy().equals(username)) {
            throw new ForbiddenException("Only the requester can cancel this purchase request");
        }
        if (entity.getStatus() == PurchaseRequestStatus.CANCELLED) {
            throw new ConflictException("Purchase request is already cancelled");
        }
        if (entity.getStatus() != PurchaseRequestStatus.DRAFT
                && entity.getStatus() != PurchaseRequestStatus.SUBMITTED
                && entity.getStatus() != PurchaseRequestStatus.UNDER_REVIEW) {
            throw new ConflictException("Purchase request can only be cancelled before purchase order creation");
        }
        // Release budget committed at submission time (returns keep the committed
        // flag until the request is cancelled or resubmitted).
        if (Boolean.TRUE.equals(entity.getBudgetCommitted())) {
            releaseBudget(entity.getCostCenter(), entity.getEstimatedAmount());
            entity.setBudgetCommitted(false);
        }
        entity.setStatus(PurchaseRequestStatus.CANCELLED);
        entity.setUpdatedBy(username);
        PurchaseRequest saved = purchaseRequestRepository.save(entity);
        eventPublisher.publish(
                BusinessEventType.PURCHASE_REQUEST_CANCELLED,
                "PurchaseRequest",
                "PurchaseRequest",
                saved.getId(),
                saved.getRequestNumber(),
                "Purchase request cancelled",
                username,
                NotificationType.PURCHASE_REQUEST
        );
        return purchaseRequestMapper.toResponse(saved);
    }

    private void commitBudget(CostCenter costCenter, BigDecimal amount) {
        BigDecimal used = costCenter.getUsedBudget() == null ? BigDecimal.ZERO : costCenter.getUsedBudget();
        BigDecimal remaining = costCenter.getRemainingBudget() == null ? costCenter.getBudget() : costCenter.getRemainingBudget();
        costCenter.setUsedBudget(used.add(amount));
        costCenter.setRemainingBudget(remaining.subtract(amount));
        costCenterRepository.save(costCenter);
    }

    private void releaseBudget(CostCenter costCenter, BigDecimal amount) {
        BigDecimal used = costCenter.getUsedBudget() == null ? BigDecimal.ZERO : costCenter.getUsedBudget();
        BigDecimal remaining = costCenter.getRemainingBudget() == null ? costCenter.getBudget() : costCenter.getRemainingBudget();
        costCenter.setUsedBudget(used.subtract(amount).max(BigDecimal.ZERO));
        costCenter.setRemainingBudget(remaining.add(amount));
        costCenterRepository.save(costCenter);
    }

    private void ensureCostCenterInDepartment(Department department, CostCenter costCenter) {
        if (!costCenter.getDepartment().getId().equals(department.getId())) {
            throw new ForbiddenException("Selected cost center does not belong to your department");
        }
    }

    private PurchaseRequest findRequest(Long id) {
        return purchaseRequestRepository.findById(id)
                .orElseThrow(() -> new PurchaseRequestNotFoundException(id));
    }

    private Employee findEmployee(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + id));
    }

    private Department findDepartment(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + id));
    }

    private CostCenter findCostCenter(Long id) {
        return costCenterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cost center not found: " + id));
    }

    private String generateRequestNumber() {
        String prefix = "PR-" + Year.now().getValue() + "-";
        long sequence = purchaseRequestRepository.count() + 1;
        String requestNumber = prefix + String.format("%06d", sequence);
        while (purchaseRequestRepository.existsByRequestNumber(requestNumber)) {
            sequence++;
            requestNumber = prefix + String.format("%06d", sequence);
        }
        return requestNumber;
    }

    private void ensureDraftAndOwner(PurchaseRequest entity) {
        if (entity.getStatus() != PurchaseRequestStatus.DRAFT) {
            throw new ConflictException("Only draft purchase requests can be changed");
        }
        String username = currentUsername();
        if (!"system".equals(entity.getCreatedBy()) && !entity.getCreatedBy().equals(username)) {
            throw new ForbiddenException("Only the requester can change this purchase request");
        }
    }

    private String currentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication == null ? "system" : authentication.getName();
    }

    private User currentUser() {
        return userRepository.findByUsername(currentUsername())
                .orElseThrow(() -> new ForbiddenException("Authenticated user not found"));
    }

    private Employee currentEmployee() {
        Employee employee = currentUser().getEmployee();
        if (employee == null) {
            throw new ForbiddenException("Authenticated user is not linked to an employee");
        }
        return employee;
    }

    private String currentRoleCode() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) return "";
        return userRepository.findByUsername(authentication.getName())
                .map(user -> user.getRole() != null ? user.getRole().getRoleCode() : "")
                .orElse("");
    }

    private java.util.List<Long> getSpecializedTeamCategoryIds(String roleCode) {
        if ("EQUIPMENT_ASSET_TEAM".equals(roleCode)) {
            return categoryRepository.findAll().stream()
                    .filter(c -> "EQUIPMENT_ASSET_TEAM".equalsIgnoreCase(c.getTeamRoleCode())
                            || (c.getCategoryCode() != null && c.getCategoryCode().toUpperCase().startsWith("HW")))
                    .map(com.procurement.category.entity.Category::getId).toList();
        } else if ("IT_SOFTWARE_TEAM".equals(roleCode)) {
            return categoryRepository.findAll().stream()
                    .filter(c -> "IT_SOFTWARE_TEAM".equalsIgnoreCase(c.getTeamRoleCode())
                            || (c.getCategoryCode() != null && c.getCategoryCode().toUpperCase().startsWith("SW")))
                    .map(com.procurement.category.entity.Category::getId).toList();
        } else if ("FACILITIES_TEAM".equals(roleCode)) {
            return categoryRepository.findAll().stream()
                    .filter(c -> "FACILITIES_TEAM".equalsIgnoreCase(c.getTeamRoleCode())
                            || (c.getCategoryCode() != null && c.getCategoryCode().toUpperCase().startsWith("FAC")))
                    .map(com.procurement.category.entity.Category::getId).toList();
        }
        return java.util.List.of();
    }

    private void checkSpecializedDomainAccess(PurchaseRequest entity) {
        String role = currentRoleCode();
        if ("SUPER_ADMIN".equals(role) || "ADMIN".equals(role) || "PROCUREMENT_MANAGER".equals(role)
                || "FINANCE_MANAGER".equals(role) || "AUDITOR".equals(role) || "DEPARTMENT_MANAGER".equals(role)
                || "SENIOR_MANAGER".equals(role) || "HEAD".equals(role)) {
            return;
        }
        if (isEmployeeOnly()) {
            if (!entity.getRequester().getId().equals(currentEmployee().getId())) {
                throw new ForbiddenException("You can only view your own purchase requests");
            }
            return;
        }
        java.util.List<Long> allowedCategoryIds = getSpecializedTeamCategoryIds(role);
        if (!allowedCategoryIds.isEmpty()) {
            java.util.List<com.procurement.purchaserequestline.entity.PurchaseRequestLine> lines =
                    purchaseRequestLineRepository.findByPurchaseRequestId(entity.getId());
            boolean hasAccess = lines.stream().anyMatch(l -> l.getProduct() != null && l.getProduct().getCategory() != null
                    && allowedCategoryIds.contains(l.getProduct().getCategory().getId()));
            if (!hasAccess && !lines.isEmpty()) {
                throw new ForbiddenException("Access denied: You do not have permission to view requests from other domains");
            }
        }
    }

    /** True when the authenticated user holds only the plain EMPLOYEE role. */
    private boolean isEmployeeOnly() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        return userRepository.findByUsername(authentication.getName())
                .map(user -> user.getRole() != null && "EMPLOYEE".equals(user.getRole().getRoleCode()))
                .orElse(false);
    }
}
