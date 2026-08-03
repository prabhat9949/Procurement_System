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
import com.procurement.purchaserequest.specification.PurchaseRequestSpecification;
import com.procurement.purchaserequest.validator.PurchaseRequestValidator;
import com.procurement.approvaltask.service.ApprovalTaskService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Year;

@Service
public class PurchaseRequestServiceImpl implements PurchaseRequestService {

    private final PurchaseRequestRepository purchaseRequestRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final CostCenterRepository costCenterRepository;
    private final PurchaseRequestMapper purchaseRequestMapper;
    private final PurchaseRequestValidator purchaseRequestValidator;
    private final ApprovalTaskService approvalTaskService;
    private final BusinessEventPublisher eventPublisher;

    public PurchaseRequestServiceImpl(PurchaseRequestRepository purchaseRequestRepository,
                                      EmployeeRepository employeeRepository,
                                      DepartmentRepository departmentRepository,
                                      CostCenterRepository costCenterRepository,
                                      PurchaseRequestMapper purchaseRequestMapper,
                                      PurchaseRequestValidator purchaseRequestValidator,
                                      ApprovalTaskService approvalTaskService,
                                      BusinessEventPublisher eventPublisher) {
        this.purchaseRequestRepository = purchaseRequestRepository;
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.costCenterRepository = costCenterRepository;
        this.purchaseRequestMapper = purchaseRequestMapper;
        this.purchaseRequestValidator = purchaseRequestValidator;
        this.approvalTaskService = approvalTaskService;
        this.eventPublisher = eventPublisher;
    }

    @Override
    @Transactional
    public PurchaseRequestResponse create(PurchaseRequestRequest request) {
        purchaseRequestValidator.validate(request);
        PurchaseRequest entity = purchaseRequestMapper.toEntity(request,
                findEmployee(request.requesterId()), findDepartment(request.departmentId()),
                findCostCenter(request.costCenterId()));
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
        Page<PurchaseRequestResponse> page = purchaseRequestRepository.findAll(
                        PurchaseRequestSpecification.search(keyword, requesterId, departmentId,
                                costCenterId, priority, status, approvalStatus, requiredDateFrom,
                                requiredDateTo, createdDateFrom, createdDateTo), pageable)
                .map(purchaseRequestMapper::toResponse);
        return new PageResponse<>(page.getContent(), page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages(), page.isLast());
    }

    @Override
    @Transactional(readOnly = true)
    public PurchaseRequestResponse getById(Long id) {
        return purchaseRequestMapper.toResponse(findRequest(id));
    }

    @Override
    @Transactional
    public PurchaseRequestResponse update(Long id, PurchaseRequestRequest request) {
        purchaseRequestValidator.validate(request);
        PurchaseRequest entity = findRequest(id);
        ensureDraftAndOwner(entity);
        purchaseRequestMapper.updateEntity(entity, request, findEmployee(request.requesterId()),
                findDepartment(request.departmentId()), findCostCenter(request.costCenterId()));
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
}
