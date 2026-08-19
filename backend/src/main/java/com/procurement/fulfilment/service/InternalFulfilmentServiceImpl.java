package com.procurement.fulfilment.service;

import com.procurement.auditlog.service.AuditLogService;
import com.procurement.common.exception.ConflictException;
import com.procurement.common.exception.ForbiddenException;
import com.procurement.common.exception.ResourceNotFoundException;
import com.procurement.common.response.PageResponse;
import com.procurement.employee.entity.Employee;
import com.procurement.employee.repository.EmployeeRepository;
import com.procurement.event.BusinessEventPublisher;
import com.procurement.event.BusinessEventType;
import com.procurement.fulfilment.dto.request.FulfilmentActionRequest;
import com.procurement.fulfilment.dto.request.InitiateFulfilmentRequest;
import com.procurement.fulfilment.dto.response.AvailabilityCheckResponse;
import com.procurement.fulfilment.dto.response.AvailabilityLineDetail;
import com.procurement.fulfilment.dto.response.InternalFulfilmentResponse;
import com.procurement.fulfilment.entity.FulfilmentType;
import com.procurement.fulfilment.entity.InternalFulfilment;
import com.procurement.fulfilment.entity.InternalFulfilmentStatus;
import com.procurement.fulfilment.repository.InternalFulfilmentRepository;
import com.procurement.rfq.service.RfqService;
import com.procurement.rfq.dto.request.RfqRequest;
import java.time.LocalDate;
import com.procurement.inventory.entity.Inventory;
import com.procurement.inventory.repository.InventoryRepository;
import com.procurement.inventory.service.InventoryTransactionService;
import com.procurement.notification.entity.NotificationType;
import com.procurement.product.entity.Product;
import com.procurement.product.repository.ProductRepository;
import com.procurement.purchaserequest.entity.ApprovalStatus;
import com.procurement.purchaserequest.entity.PurchaseRequest;
import com.procurement.purchaserequest.entity.PurchaseRequestStatus;
import com.procurement.purchaserequest.repository.PurchaseRequestRepository;
import com.procurement.purchaserequestline.entity.PurchaseRequestLine;
import com.procurement.purchaserequestline.repository.PurchaseRequestLineRepository;
import com.procurement.user.entity.User;
import com.procurement.user.repository.UserRepository;
import com.procurement.warehouse.entity.Warehouse;
import com.procurement.warehouse.repository.WarehouseRepository;
import com.procurement.workflow.service.WorkflowService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class InternalFulfilmentServiceImpl implements InternalFulfilmentService {

    private final InternalFulfilmentRepository fulfilmentRepository;
    private final PurchaseRequestRepository requestRepository;
    private final PurchaseRequestLineRepository requestLineRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final WarehouseRepository warehouseRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final InventoryTransactionService transactionService;
    private final WorkflowService workflowService;
    private final BusinessEventPublisher eventPublisher;
    private final AuditLogService auditLogService;
    private final RfqService rfqService;

    public InternalFulfilmentServiceImpl(
            InternalFulfilmentRepository fulfilmentRepository,
            PurchaseRequestRepository requestRepository,
            PurchaseRequestLineRepository requestLineRepository,
            ProductRepository productRepository,
            InventoryRepository inventoryRepository,
            WarehouseRepository warehouseRepository,
            EmployeeRepository employeeRepository,
            UserRepository userRepository,
            InventoryTransactionService transactionService,
            WorkflowService workflowService,
            BusinessEventPublisher eventPublisher,
            AuditLogService auditLogService,
            RfqService rfqService) {
        this.fulfilmentRepository = fulfilmentRepository;
        this.requestRepository = requestRepository;
        this.requestLineRepository = requestLineRepository;
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
        this.warehouseRepository = warehouseRepository;
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
        this.transactionService = transactionService;
        this.workflowService = workflowService;
        this.eventPublisher = eventPublisher;
        this.auditLogService = auditLogService;
        this.rfqService = rfqService;
    }

    private String currentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth == null ? "system" : auth.getName();
    }

    private User currentUser() {
        return userRepository.findByUsername(currentUsername()).orElse(null);
    }

    private Employee currentEmployee() {
        User u = currentUser();
        return u == null ? null : u.getEmployee();
    }

    private String currentRoleCode() {
        User u = currentUser();
        return u == null || u.getRole() == null ? "" : u.getRole().getRoleCode();
    }

    private String generateFulfilmentNumber() {
        return "IF-" + Year.now().getValue() + "-" + String.format("%06d", fulfilmentRepository.count() + 1);
    }

    private String name(Employee e) {
        return e == null ? "" : e.getFirstName() + " " + (e.getLastName() == null ? "" : e.getLastName());
    }

    private String resolveTeamRole(Product product) {
        if (product.getCategory() != null && product.getCategory().getTeamRoleCode() != null
                && !product.getCategory().getTeamRoleCode().isBlank()) {
            return product.getCategory().getTeamRoleCode();
        }
        if (Boolean.TRUE.equals(product.getIsDigital())) {
            return "IT_SOFTWARE_TEAM";
        }
        String catCode = product.getCategory() == null ? "" : product.getCategory().getCategoryCode().toUpperCase();
        if (catCode.startsWith("HW")) return "EQUIPMENT_ASSET_TEAM";
        if (catCode.startsWith("SW")) return "IT_SOFTWARE_TEAM";
        if (catCode.startsWith("FAC")) return "FACILITIES_TEAM";
        return "EQUIPMENT_ASSET_TEAM";
    }

    private FulfilmentType resolveFulfilmentType(Product product) {
        if (Boolean.TRUE.equals(product.getIsDigital())) return FulfilmentType.SOFTWARE_LICENSE;
        String team = resolveTeamRole(product);
        if ("IT_SOFTWARE_TEAM".equals(team)) return FulfilmentType.SOFTWARE_LICENSE;
        if ("FACILITIES_TEAM".equals(team)) return FulfilmentType.FACILITIES_RESOURCE;
        return FulfilmentType.PHYSICAL_EQUIPMENT;
    }

    private InternalFulfilmentResponse toResponse(InternalFulfilment f) {
        return new InternalFulfilmentResponse(
                f.getId(),
                f.getFulfilmentNumber(),
                f.getPurchaseRequest().getId(),
                f.getPurchaseRequest().getRequestNumber(),
                f.getPurchaseRequestLine() == null ? null : f.getPurchaseRequestLine().getId(),
                f.getProduct().getId(),
                f.getProduct().getProductCode(),
                f.getProduct().getProductName(),
                f.getProduct().getSku(),
                f.getProduct().getIsDigital(),
                f.getRequester().getId(),
                name(f.getRequester()),
                f.getRequester().getDepartment() == null ? "" : f.getRequester().getDepartment().getDepartmentName(),
                f.getDepartment().getId(),
                f.getDepartment().getDepartmentName(),
                f.getSpecializedTeam(),
                f.getWarehouse() == null ? null : f.getWarehouse().getId(),
                f.getWarehouse() == null ? null : f.getWarehouse().getWarehouseName(),
                f.getAssignedEmployee() == null ? null : f.getAssignedEmployee().getId(),
                name(f.getAssignedEmployee()),
                f.getAssignedBy() == null ? null : f.getAssignedBy().getId(),
                name(f.getAssignedBy()),
                f.getFulfilmentType().name(),
                f.getStatus().name(),
                f.getRequestedQuantity(),
                f.getAvailableQuantity(),
                f.getAllocatedQuantity(),
                f.getDeliveredQuantity(),
                f.getShortageQuantity(),
                f.getLicenseKeyAssigned(),
                f.getAssetTag(),
                f.getDeliveryLocation(),
                f.getRemarks(),
                f.getAllocatedAt(),
                f.getDispatchedAt(),
                f.getDeliveredAt(),
                f.getCompletedAt(),
                f.getCreatedAt(),
                f.getUpdatedAt()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public AvailabilityCheckResponse checkAvailability(Long purchaseRequestId) {
        PurchaseRequest pr = requestRepository.findById(purchaseRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase request not found: " + purchaseRequestId));

        List<PurchaseRequestLine> lines = requestLineRepository.findByPurchaseRequestId(pr.getId());
        if (lines.isEmpty()) {
            throw new ConflictException("Purchase request has no item lines to check");
        }

        List<AvailabilityLineDetail> lineDetails = new ArrayList<>();
        BigDecimal totalRequested = BigDecimal.ZERO;
        BigDecimal totalAvailable = BigDecimal.ZERO;
        BigDecimal totalShortage = BigDecimal.ZERO;
        String resolvedTeam = null;

        for (PurchaseRequestLine line : lines) {
            Product product = line.getProduct();
            if (product == null) continue;

            if (resolvedTeam == null) {
                resolvedTeam = resolveTeamRole(product);
            }

            BigDecimal reqQty = line.getQuantity() != null ? line.getQuantity() : BigDecimal.ONE;
            totalRequested = totalRequested.add(reqQty);

            BigDecimal availQty = BigDecimal.ZERO;
            BigDecimal resQty = BigDecimal.ZERO;
            Warehouse matchedWarehouse = null;

            if (Boolean.TRUE.equals(product.getIsDigital())) {
                int total = product.getTotalLicenses() != null ? product.getTotalLicenses() : 0;
                int allocated = product.getAllocatedLicenses() != null ? product.getAllocatedLicenses() : 0;
                availQty = BigDecimal.valueOf(Math.max(0, total - allocated));
                resQty = BigDecimal.valueOf(allocated);
            } else {
                List<Inventory> invList = inventoryRepository.findByProductId(product.getId());
                for (Inventory inv : invList) {
                    BigDecimal a = inv.getAvailableQuantity() != null ? inv.getAvailableQuantity() : BigDecimal.ZERO;
                    BigDecimal r = inv.getReservedQuantity() != null ? inv.getReservedQuantity() : BigDecimal.ZERO;
                    BigDecimal netAvail = a.subtract(r).max(BigDecimal.ZERO);
                    availQty = availQty.add(netAvail);
                    resQty = resQty.add(r);
                    if (matchedWarehouse == null && inv.getWarehouse() != null) {
                        matchedWarehouse = inv.getWarehouse();
                    }
                }
            }

            BigDecimal shortage = reqQty.subtract(availQty).max(BigDecimal.ZERO);
            totalAvailable = totalAvailable.add(availQty.min(reqQty));
            totalShortage = totalShortage.add(shortage);

            boolean fullyAvail = availQty.compareTo(reqQty) >= 0;
            boolean partAvail = availQty.compareTo(BigDecimal.ZERO) > 0 && availQty.compareTo(reqQty) < 0;
            boolean unavail = availQty.compareTo(BigDecimal.ZERO) <= 0;

            lineDetails.add(new AvailabilityLineDetail(
                    line.getId(),
                    product.getId(),
                    product.getProductCode(),
                    product.getProductName(),
                    product.getCategory() == null ? "General" : product.getCategory().getCategoryName(),
                    resolveTeamRole(product),
                    product.getIsDigital(),
                    reqQty,
                    availQty,
                    resQty,
                    shortage,
                    fullyAvail,
                    partAvail,
                    unavail,
                    matchedWarehouse == null ? "Main Warehouse" : matchedWarehouse.getWarehouseName(),
                    matchedWarehouse == null ? null : matchedWarehouse.getId()
            ));
        }

        String overallStatus;
        String recommendedAction;
        if (totalShortage.compareTo(BigDecimal.ZERO) == 0) {
            overallStatus = "FULLY_AVAILABLE";
            recommendedAction = "INTERNAL_FULFILMENT";
        } else if (totalAvailable.compareTo(BigDecimal.ZERO) > 0) {
            overallStatus = "PARTIALLY_AVAILABLE";
            recommendedAction = "PARTIAL_FULFILMENT_AND_EXTERNAL_PROCUREMENT";
        } else {
            overallStatus = "UNAVAILABLE";
            recommendedAction = "EXTERNAL_PROCUREMENT_REQUIRED";
        }

        return new AvailabilityCheckResponse(
                pr.getId(),
                pr.getRequestNumber(),
                name(pr.getRequester()),
                pr.getDepartment() == null ? "" : pr.getDepartment().getDepartmentName(),
                overallStatus,
                recommendedAction,
                totalRequested,
                totalAvailable,
                totalShortage,
                resolvedTeam != null ? resolvedTeam : "EQUIPMENT_ASSET_TEAM",
                lineDetails
        );
    }

    @Override
    @Transactional
    public List<InternalFulfilmentResponse> initiateFulfilment(Long purchaseRequestId, InitiateFulfilmentRequest request) {
        PurchaseRequest pr = requestRepository.findById(purchaseRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase request not found: " + purchaseRequestId));

        // A purchase request can enter fulfilment initiation from any post-approval
        // state. Final approval (ApprovalTaskServiceImpl) already runs the availability
        // check and pre-flags the PR as INTERNAL_FULFILMENT_IN_PROGRESS,
        // PARTIAL_FULFILMENT_PENDING or EXTERNAL_PROCUREMENT_REQUIRED, so the
        // Procurement Manager must be able to pick up the request from those states.
        if (pr.getStatus() != PurchaseRequestStatus.APPROVED
                && pr.getStatus() != PurchaseRequestStatus.INTERNAL_AVAILABILITY_CHECK
                && pr.getStatus() != PurchaseRequestStatus.INTERNALLY_FULFILLABLE
                && pr.getStatus() != PurchaseRequestStatus.INTERNAL_FULFILMENT_IN_PROGRESS
                && pr.getStatus() != PurchaseRequestStatus.PARTIAL_FULFILMENT_PENDING
                && pr.getStatus() != PurchaseRequestStatus.EXTERNAL_PROCUREMENT_REQUIRED) {
            throw new ConflictException("Purchase request is not in a valid state for fulfilment initiation: " + pr.getStatus());
        }

        AvailabilityCheckResponse check = checkAvailability(purchaseRequestId);
        String actionType = request.actionType().trim().toUpperCase();
        List<InternalFulfilment> createdFulfilments = new ArrayList<>();

        if ("EXTERNAL_PROCUREMENT".equals(actionType) || "EXTERNAL_PROCUREMENT_REQUIRED".equals(actionType)) {
            pr.setStatus(PurchaseRequestStatus.EXTERNAL_PROCUREMENT_REQUIRED);
            requestRepository.save(pr);
            eventPublisher.publish(
                    BusinessEventType.PURCHASE_REQUEST_UPDATED,
                    "PurchaseRequest", "InternalAvailability",
                    pr.getId(), pr.getRequestNumber(),
                    "External procurement required due to stock unavailability",
                    currentUsername(), NotificationType.PROCUREMENT
            );
            // Automatically generate RFQ for the purchase request
            RfqRequest rfqReq = new RfqRequest(
                    pr.getId(),
                    LocalDate.now().plusDays(7), // closing date
                    LocalDate.now().plusDays(9), // quotation opening date
                    "INR",
                    "Auto-generated RFQ after external procurement trigger"
            );
            rfqService.generate(rfqReq);
            return List.of();
        }

        Employee assignTo = null;
        if (request.assignedEmployeeId() != null) {
            assignTo = employeeRepository.findById(request.assignedEmployeeId()).orElse(null);
        }
        if (assignTo == null) {
            // Find employee for team
            assignTo = findOfficerForTeam(check.specializedTeam());
        }

        Warehouse warehouse = null;
        if (request.warehouseId() != null) {
            warehouse = warehouseRepository.findById(request.warehouseId()).orElse(null);
        }
        if (warehouse == null) {
            warehouse = warehouseRepository.findAll().stream().findFirst().orElse(null);
        }

        boolean externalShortage = false;
        for (AvailabilityLineDetail lineDetail : check.lines()) {
            PurchaseRequestLine prLine = requestLineRepository.findById(lineDetail.lineId()).orElse(null);
            Product product = productRepository.findById(lineDetail.productId()).orElseThrow();

            BigDecimal reqQty = lineDetail.requestedQuantity();
            BigDecimal availQty = lineDetail.availableQuantity();
            BigDecimal allocateQty = reqQty.min(availQty);
            BigDecimal shortageQty = reqQty.subtract(allocateQty).max(BigDecimal.ZERO);

            if (allocateQty.compareTo(BigDecimal.ZERO) > 0) {
                // Reserve / Allocate stock in database transactionally
                transactionService.allocateStock(
                        product, warehouse, allocateQty, pr, pr.getRequester(),
                        "Internal fulfilment allocation for " + pr.getRequestNumber()
                );

                InternalFulfilment fulfilment = InternalFulfilment.builder()
                        .fulfilmentNumber(generateFulfilmentNumber())
                        .purchaseRequest(pr)
                        .purchaseRequestLine(prLine)
                        .product(product)
                        .requester(pr.getRequester())
                        .department(pr.getDepartment())
                        .specializedTeam(lineDetail.teamRoleCode())
                        .warehouse(warehouse)
                        .assignedEmployee(assignTo)
                        .assignedBy(currentEmployee())
                        .fulfilmentType(resolveFulfilmentType(product))
                        .status(InternalFulfilmentStatus.ALLOCATED)
                        .requestedQuantity(reqQty)
                        .availableQuantity(availQty)
                        .allocatedQuantity(allocateQty)
                        .deliveredQuantity(BigDecimal.ZERO)
                        .shortageQuantity(shortageQty)
                        .remarks(request.remarks())
                        .allocatedAt(LocalDateTime.now())
                        .build();

                createdFulfilments.add(fulfilmentRepository.save(fulfilment));
            }
            if (shortageQty.compareTo(BigDecimal.ZERO) > 0) {
                externalShortage = true;
            }
        }

        // A single RFQ for the whole request — it only ever covers the shortage
        // quantity (requested minus internally allocated), never the full amount.
        boolean rfqGenerated = false;
        if (externalShortage && request.quantityForExternalProcurement() != null
                && request.quantityForExternalProcurement().compareTo(BigDecimal.ZERO) > 0) {
            RfqRequest rfqReq = new RfqRequest(
                    pr.getId(),
                    LocalDate.now().plusDays(7),
                    LocalDate.now().plusDays(9),
                    "INR",
                    "Auto-generated RFQ for shortage quantity"
            );
            rfqService.generate(rfqReq); // sets PR status to RFQ_CREATED and saves it
            rfqGenerated = true;
        }

        if ("FULL_INTERNAL".equals(actionType) && check.totalShortageQuantity().compareTo(BigDecimal.ZERO) == 0) {
            pr.setStatus(PurchaseRequestStatus.INTERNAL_FULFILMENT_IN_PROGRESS);
        } else if (!rfqGenerated) {
            // Shortage remains but no RFQ was requested — stay in the partial queue.
            pr.setStatus(PurchaseRequestStatus.PARTIAL_FULFILMENT_PENDING);
        }
        requestRepository.save(pr);

        eventPublisher.publish(
                BusinessEventType.PURCHASE_REQUEST_UPDATED,
                "PurchaseRequest", "InternalFulfilment",
                pr.getId(), pr.getRequestNumber(),
                "Internal fulfilment initiated: " + actionType,
                currentUsername(), NotificationType.FULFILMENT
        );

        return createdFulfilments.stream().map(this::toResponse).toList();
    }

    private Employee findOfficerForTeam(String teamRole) {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() != null && teamRole.equalsIgnoreCase(u.getRole().getRoleCode()))
                .map(User::getEmployee)
                .filter(e -> e != null)
                .findFirst()
                .orElse(null);
    }

    private void enforceTeamAccess(InternalFulfilment f) {
        String role = currentRoleCode();
        if ("SUPER_ADMIN".equals(role) || "ADMIN".equals(role) || "PROCUREMENT_MANAGER".equals(role)) {
            return;
        }
        if (f.getRequester() != null && currentEmployee() != null && f.getRequester().getId().equals(currentEmployee().getId())) {
            return;
        }
        if ("EQUIPMENT_ASSET_TEAM".equals(role) && !"EQUIPMENT_ASSET_TEAM".equals(f.getSpecializedTeam())) {
            throw new ForbiddenException("Access denied: Equipment team cannot access tasks of " + f.getSpecializedTeam());
        }
        if ("IT_SOFTWARE_TEAM".equals(role) && !"IT_SOFTWARE_TEAM".equals(f.getSpecializedTeam())) {
            throw new ForbiddenException("Access denied: Software team cannot access tasks of " + f.getSpecializedTeam());
        }
        if ("FACILITIES_TEAM".equals(role) && !"FACILITIES_TEAM".equals(f.getSpecializedTeam())) {
            throw new ForbiddenException("Access denied: Facilities team cannot access tasks of " + f.getSpecializedTeam());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public InternalFulfilmentResponse getById(Long id) {
        InternalFulfilment f = fulfilmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fulfilment task not found: " + id));
        enforceTeamAccess(f);
        return toResponse(f);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<InternalFulfilmentResponse> search(String specializedTeam, String status, Long assignedEmployeeId, Long requesterId, Pageable pageable) {
        String role = currentRoleCode();
        if ("EQUIPMENT_ASSET_TEAM".equals(role)) specializedTeam = "EQUIPMENT_ASSET_TEAM";
        else if ("IT_SOFTWARE_TEAM".equals(role)) specializedTeam = "IT_SOFTWARE_TEAM";
        else if ("FACILITIES_TEAM".equals(role)) specializedTeam = "FACILITIES_TEAM";

        Specification<InternalFulfilment> spec = (root, query, cb) -> cb.conjunction();
        if (specializedTeam != null && !specializedTeam.isBlank()) {
            final String team = specializedTeam;
            spec = spec.and((root, query, cb) -> cb.equal(root.get("specializedTeam"), team));
        }
        if (status != null && !status.isBlank()) {
            try {
                InternalFulfilmentStatus st = InternalFulfilmentStatus.valueOf(status.trim().toUpperCase());
                spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), st));
            } catch (Exception ignored) {}
        }
        if (assignedEmployeeId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("assignedEmployee").get("id"), assignedEmployeeId));
        }
        if (requesterId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("requester").get("id"), requesterId));
        }

        Page<InternalFulfilmentResponse> page = fulfilmentRepository.findAll(spec, pageable).map(this::toResponse);
        return new PageResponse<>(page.getContent(), page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages(), page.isLast());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<InternalFulfilmentResponse> getMyTasks(Pageable pageable) {
        Employee emp = currentEmployee();
        if (emp == null) return new PageResponse<>(List.of(), 0, pageable.getPageSize(), 0, 0, true);
        Page<InternalFulfilmentResponse> p = fulfilmentRepository.findByAssignedEmployeeId(emp.getId(), pageable).map(this::toResponse);
        return new PageResponse<>(p.getContent(), p.getNumber(), p.getSize(), p.getTotalElements(), p.getTotalPages(), p.isLast());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<InternalFulfilmentResponse> getTeamTasks(String teamRole, Pageable pageable) {
        String role = currentRoleCode();
        // Procurement managers and admins oversee every fulfilment team, so they
        // see the full task pool; specialised teams only see their own queue.
        if ("SUPER_ADMIN".equals(role) || "ADMIN".equals(role) || "PROCUREMENT_MANAGER".equals(role)) {
            Page<InternalFulfilmentResponse> all =
                    fulfilmentRepository.findAll(pageable).map(this::toResponse);
            return new PageResponse<>(all.getContent(), all.getNumber(), all.getSize(),
                    all.getTotalElements(), all.getTotalPages(), all.isLast());
        }

        String effectiveTeam = teamRole;
        if ("EQUIPMENT_ASSET_TEAM".equals(role)) effectiveTeam = "EQUIPMENT_ASSET_TEAM";
        else if ("IT_SOFTWARE_TEAM".equals(role)) effectiveTeam = "IT_SOFTWARE_TEAM";
        else if ("FACILITIES_TEAM".equals(role)) effectiveTeam = "FACILITIES_TEAM";

        if (effectiveTeam == null || effectiveTeam.isBlank()) {
            effectiveTeam = role;
        }

        Page<InternalFulfilmentResponse> p = fulfilmentRepository.findBySpecializedTeam(effectiveTeam, pageable).map(this::toResponse);
        return new PageResponse<>(p.getContent(), p.getNumber(), p.getSize(), p.getTotalElements(), p.getTotalPages(), p.isLast());
    }

    @Override
    @Transactional
    public InternalFulfilmentResponse confirmStock(Long id, FulfilmentActionRequest request) {
        InternalFulfilment f = fulfilmentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Task not found: " + id));
        enforceTeamAccess(f);
        f.setStatus(InternalFulfilmentStatus.CONFIRMED);
        if (request != null && request.remarks() != null) f.setRemarks(request.remarks());
        return toResponse(fulfilmentRepository.save(f));
    }

    @Override
    @Transactional
    public InternalFulfilmentResponse allocateStock(Long id, FulfilmentActionRequest request) {
        InternalFulfilment f = fulfilmentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Task not found: " + id));
        enforceTeamAccess(f);
        f.setStatus(InternalFulfilmentStatus.ALLOCATED);
        f.setAllocatedAt(LocalDateTime.now());
        if (request != null) {
            if (request.licenseKeyAssigned() != null) f.setLicenseKeyAssigned(request.licenseKeyAssigned());
            if (request.assetTag() != null) f.setAssetTag(request.assetTag());
            if (request.remarks() != null) f.setRemarks(request.remarks());
        }
        return toResponse(fulfilmentRepository.save(f));
    }

    @Override
    @Transactional
    public InternalFulfilmentResponse dispatchStock(Long id, FulfilmentActionRequest request) {
        InternalFulfilment f = fulfilmentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Task not found: " + id));
        enforceTeamAccess(f);
        f.setStatus(InternalFulfilmentStatus.DISPATCHED);
        f.setDispatchedAt(LocalDateTime.now());
        if (request != null) {
            if (request.deliveryLocation() != null) f.setDeliveryLocation(request.deliveryLocation());
            if (request.assetTag() != null) f.setAssetTag(request.assetTag());
            if (request.licenseKeyAssigned() != null) f.setLicenseKeyAssigned(request.licenseKeyAssigned());
            if (request.remarks() != null) f.setRemarks(request.remarks());
        }
        return toResponse(fulfilmentRepository.save(f));
    }

    @Override
    @Transactional
    public InternalFulfilmentResponse completeFulfilment(Long id, FulfilmentActionRequest request) {
        InternalFulfilment f = fulfilmentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Task not found: " + id));
        enforceTeamAccess(f);

        BigDecimal delivered = request != null && request.quantity() != null ? request.quantity() : f.getAllocatedQuantity();
        f.setDeliveredQuantity(delivered);
        f.setStatus(InternalFulfilmentStatus.COMPLETED);
        f.setCompletedAt(LocalDateTime.now());

        if (request != null) {
            if (request.licenseKeyAssigned() != null) f.setLicenseKeyAssigned(request.licenseKeyAssigned());
            if (request.assetTag() != null) f.setAssetTag(request.assetTag());
            if (request.remarks() != null) f.setRemarks(request.remarks());
        }

        // Issue stock from inventory ledger
        transactionService.issueStock(
                f.getProduct(), f.getWarehouse(), delivered,
                f.getPurchaseRequest(), f.getRequester(),
                "Completed internal fulfilment " + f.getFulfilmentNumber()
        );

        InternalFulfilment saved = fulfilmentRepository.save(f);

        // Check if all fulfilments for this PR are completed
        List<InternalFulfilment> allForPr = fulfilmentRepository.findByPurchaseRequestIdOrderByCreatedAtAsc(f.getPurchaseRequest().getId());
        boolean allDone = allForPr.stream().allMatch(x -> x.getStatus() == InternalFulfilmentStatus.COMPLETED);
        if (allDone && f.getPurchaseRequest().getStatus() == PurchaseRequestStatus.INTERNAL_FULFILMENT_IN_PROGRESS) {
            PurchaseRequest pr = f.getPurchaseRequest();
            pr.setStatus(PurchaseRequestStatus.COMPLETED);
            requestRepository.save(pr);
        }

        eventPublisher.publish(
                BusinessEventType.PURCHASE_REQUEST_COMPLETED,
                "PurchaseRequest", "InternalFulfilmentCompleted",
                f.getPurchaseRequest().getId(), f.getPurchaseRequest().getRequestNumber(),
                "Internal fulfilment completed: " + f.getFulfilmentNumber(),
                currentUsername(), NotificationType.FULFILMENT
        );

        return toResponse(saved);
    }

    @Override
    @Transactional
    public InternalFulfilmentResponse cancelFulfilment(Long id, String reason) {
        InternalFulfilment f = fulfilmentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Task not found: " + id));
        enforceTeamAccess(f);

        if (f.getStatus() == InternalFulfilmentStatus.COMPLETED) {
            throw new ConflictException("Completed fulfilment cannot be cancelled");
        }

        // Release allocated stock
        transactionService.releaseAllocation(
                f.getProduct(), f.getWarehouse(), f.getAllocatedQuantity(),
                f.getPurchaseRequest(), "Fulfilment cancelled: " + reason
        );

        f.setStatus(InternalFulfilmentStatus.CANCELLED);
        f.setRemarks("Cancelled: " + reason);
        return toResponse(fulfilmentRepository.save(f));
    }
}
