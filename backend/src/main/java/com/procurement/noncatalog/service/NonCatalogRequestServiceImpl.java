package com.procurement.noncatalog.service;

import com.procurement.category.entity.Category;
import com.procurement.category.repository.CategoryRepository;
import com.procurement.common.exception.ConflictException;
import com.procurement.common.exception.ForbiddenException;
import com.procurement.common.exception.ResourceNotFoundException;
import com.procurement.common.response.PageResponse;
import com.procurement.employee.entity.Employee;
import com.procurement.employee.repository.EmployeeRepository;
import com.procurement.event.BusinessEventPublisher;
import com.procurement.event.BusinessEventType;
import com.procurement.inventory.dto.request.InventoryAdjustmentRequest;
import com.procurement.inventory.service.InventoryTransactionService;
import com.procurement.noncatalog.dto.request.NonCatalogCreateRequest;
import com.procurement.noncatalog.dto.request.NonCatalogReviewRequest;
import com.procurement.noncatalog.dto.response.NonCatalogResponse;
import com.procurement.noncatalog.entity.NonCatalogRequest;
import com.procurement.noncatalog.entity.NonCatalogRequestStatus;
import com.procurement.noncatalog.repository.NonCatalogRequestRepository;
import com.procurement.notification.entity.NotificationType;
import com.procurement.product.entity.Product;
import com.procurement.product.repository.ProductRepository;
import com.procurement.uom.entity.UnitOfMeasure;
import com.procurement.uom.repository.UnitOfMeasureRepository;
import com.procurement.user.entity.User;
import com.procurement.user.repository.UserRepository;
import com.procurement.vendor.entity.Vendor;
import com.procurement.vendor.repository.VendorRepository;
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

@Service
public class NonCatalogRequestServiceImpl implements NonCatalogRequestService {

    private final NonCatalogRequestRepository ncrRepository;
    private final EmployeeRepository employeeRepository;
    private final CategoryRepository categoryRepository;
    private final UnitOfMeasureRepository uomRepository;
    private final ProductRepository productRepository;
    private final VendorRepository vendorRepository;
    private final UserRepository userRepository;
    private final InventoryTransactionService transactionService;
    private final BusinessEventPublisher eventPublisher;

    public NonCatalogRequestServiceImpl(
            NonCatalogRequestRepository ncrRepository,
            EmployeeRepository employeeRepository,
            CategoryRepository categoryRepository,
            UnitOfMeasureRepository uomRepository,
            ProductRepository productRepository,
            VendorRepository vendorRepository,
            UserRepository userRepository,
            InventoryTransactionService transactionService,
            BusinessEventPublisher eventPublisher) {
        this.ncrRepository = ncrRepository;
        this.employeeRepository = employeeRepository;
        this.categoryRepository = categoryRepository;
        this.uomRepository = uomRepository;
        this.productRepository = productRepository;
        this.vendorRepository = vendorRepository;
        this.userRepository = userRepository;
        this.transactionService = transactionService;
        this.eventPublisher = eventPublisher;
    }

    private String currentUsername() {
        Authentication a = SecurityContextHolder.getContext().getAuthentication();
        return a == null ? "system" : a.getName();
    }

    private Employee currentEmployee() {
        return userRepository.findByUsername(currentUsername())
                .map(User::getEmployee)
                .orElse(null);
    }

    private String name(Employee e) {
        return e == null ? "" : e.getFirstName() + " " + (e.getLastName() == null ? "" : e.getLastName());
    }

    private String generateNumber() {
        return "NCR-" + Year.now().getValue() + "-" + String.format("%06d", ncrRepository.count() + 1);
    }

    private NonCatalogResponse toResponse(NonCatalogRequest r) {
        return new NonCatalogResponse(
                r.getId(),
                r.getRequestNumber(),
                r.getItemName(),
                r.getDescription(),
                r.getCategory() == null ? null : r.getCategory().getId(),
                r.getCategory() == null ? null : r.getCategory().getCategoryName(),
                r.getQuantity(),
                r.getUnitOfMeasure() == null ? null : r.getUnitOfMeasure().getId(),
                r.getUnitOfMeasure() == null ? null : r.getUnitOfMeasure().getUomCode(),
                r.getEstimatedUnitPrice(),
                r.getEstimatedTotalAmount(),
                r.getBusinessJustification(),
                r.getSpecifications(),
                r.getPreferredVendor(),
                r.getRequiredDate(),
                r.getRequester().getId(),
                name(r.getRequester()),
                r.getDepartment().getId(),
                r.getDepartment().getDepartmentName(),
                r.getPurchaseRequest() == null ? null : r.getPurchaseRequest().getId(),
                r.getPurchaseRequest() == null ? null : r.getPurchaseRequest().getRequestNumber(),
                r.getStatus().name(),
                r.getHrReviewer() == null ? null : r.getHrReviewer().getId(),
                name(r.getHrReviewer()),
                r.getHrRemarks(),
                r.getHrReviewedAt(),
                r.getProcurementReviewer() == null ? null : r.getProcurementReviewer().getId(),
                name(r.getProcurementReviewer()),
                r.getProcurementRemarks(),
                r.getProcurementReviewedAt(),
                r.getCreatedProduct() == null ? null : r.getCreatedProduct().getId(),
                r.getCreatedProduct() == null ? null : r.getCreatedProduct().getProductCode(),
                r.getCreatedProduct() == null ? null : r.getCreatedProduct().getProductName(),
                r.getCreatedAt(),
                r.getUpdatedAt()
        );
    }

    @Override
    @Transactional
    public NonCatalogResponse create(NonCatalogCreateRequest request) {
        Employee requester = currentEmployee();
        if (requester == null) {
            throw new ForbiddenException("Authenticated user is not linked to an employee");
        }

        Category category = null;
        if (request.categoryId() != null) {
            category = categoryRepository.findById(request.categoryId()).orElse(null);
        }
        UnitOfMeasure uom = null;
        if (request.unitOfMeasureId() != null) {
            uom = uomRepository.findById(request.unitOfMeasureId()).orElse(null);
        }

        BigDecimal unitPrice = request.estimatedUnitPrice() != null ? request.estimatedUnitPrice() : BigDecimal.ZERO;
        BigDecimal total = unitPrice.multiply(request.quantity());

        NonCatalogRequest ncr = NonCatalogRequest.builder()
                .requestNumber(generateNumber())
                .itemName(request.itemName())
                .description(request.description())
                .category(category)
                .quantity(request.quantity())
                .unitOfMeasure(uom)
                .estimatedUnitPrice(unitPrice)
                .estimatedTotalAmount(total)
                .businessJustification(request.businessJustification())
                .specifications(request.specifications())
                .preferredVendor(request.preferredVendor())
                .requiredDate(request.requiredDate())
                .requester(requester)
                .department(requester.getDepartment())
                .status(NonCatalogRequestStatus.PENDING_HR_REVIEW)
                .createdAt(LocalDateTime.now())
                .build();

        NonCatalogRequest saved = ncrRepository.save(ncr);
        eventPublisher.publish(
                BusinessEventType.PURCHASE_REQUEST_CREATED,
                "NonCatalogRequest", "Created",
                saved.getId(), saved.getRequestNumber(),
                "Non-catalog item request created: " + saved.getItemName(),
                currentUsername(), NotificationType.SYSTEM
        );

        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public NonCatalogResponse getById(Long id) {
        return ncrRepository.findById(id).map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Non-catalog request not found: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<NonCatalogResponse> search(String status, Long departmentId, Long requesterId, Pageable pageable) {
        Specification<NonCatalogRequest> spec = (root, query, cb) -> cb.conjunction();
        if (status != null && !status.isBlank()) {
            try {
                NonCatalogRequestStatus st = NonCatalogRequestStatus.valueOf(status.trim().toUpperCase());
                spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), st));
            } catch (Exception ignored) {}
        }
        if (departmentId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("department").get("id"), departmentId));
        }
        if (requesterId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("requester").get("id"), requesterId));
        }
        Page<NonCatalogResponse> page = ncrRepository.findAll(spec, pageable).map(this::toResponse);
        return new PageResponse<>(page.getContent(), page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages(), page.isLast());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<NonCatalogResponse> getMyRequests(Pageable pageable) {
        Employee emp = currentEmployee();
        if (emp == null) return new PageResponse<>(java.util.List.of(), 0, pageable.getPageSize(), 0, 0, true);
        Page<NonCatalogResponse> p = ncrRepository.findByRequesterId(emp.getId(), pageable).map(this::toResponse);
        return new PageResponse<>(p.getContent(), p.getNumber(), p.getSize(), p.getTotalElements(), p.getTotalPages(), p.isLast());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<NonCatalogResponse> getPendingHrReview(Pageable pageable) {
        Page<NonCatalogResponse> p = ncrRepository.findByStatus(NonCatalogRequestStatus.PENDING_HR_REVIEW, pageable).map(this::toResponse);
        return new PageResponse<>(p.getContent(), p.getNumber(), p.getSize(), p.getTotalElements(), p.getTotalPages(), p.isLast());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<NonCatalogResponse> getPendingProcurementReview(Pageable pageable) {
        Page<NonCatalogResponse> p = ncrRepository.findByStatus(NonCatalogRequestStatus.HR_APPROVED_FORWARDED, pageable).map(this::toResponse);
        return new PageResponse<>(p.getContent(), p.getNumber(), p.getSize(), p.getTotalElements(), p.getTotalPages(), p.isLast());
    }

    @Override
    @Transactional
    public NonCatalogResponse reviewByHr(Long id, NonCatalogReviewRequest request) {
        NonCatalogRequest ncr = ncrRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Non-catalog request not found: " + id));

        if (ncr.getStatus() != NonCatalogRequestStatus.PENDING_HR_REVIEW) {
            throw new ConflictException("Request is not pending HR review: " + ncr.getStatus());
        }

        Employee hr = currentEmployee();
        ncr.setHrReviewer(hr);
        ncr.setHrRemarks(request.remarks());
        ncr.setHrReviewedAt(LocalDateTime.now());

        String action = request.action().trim().toUpperCase();
        if ("APPROVE".equals(action)) {
            ncr.setStatus(NonCatalogRequestStatus.HR_APPROVED_FORWARDED);
        } else if ("RETURN".equals(action)) {
            ncr.setStatus(NonCatalogRequestStatus.HR_RETURNED);
        } else if ("REJECT".equals(action)) {
            ncr.setStatus(NonCatalogRequestStatus.HR_REJECTED);
        } else {
            throw new ConflictException("Invalid HR action: " + action);
        }

        return toResponse(ncrRepository.save(ncr));
    }

    @Override
    @Transactional
    public NonCatalogResponse processByProcurement(Long id, NonCatalogReviewRequest request) {
        NonCatalogRequest ncr = ncrRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Non-catalog request not found: " + id));

        Employee procOfficer = currentEmployee();
        ncr.setProcurementReviewer(procOfficer);
        ncr.setProcurementRemarks(request.remarks());
        ncr.setProcurementReviewedAt(LocalDateTime.now());

        String action = request.action().trim().toUpperCase();

        if ("LINK_PRODUCT".equals(action)) {
            if (request.linkProductId() == null) {
                throw new ConflictException("linkProductId is required to link existing catalogue product");
            }
            Product p = productRepository.findById(request.linkProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + request.linkProductId()));
            ncr.setCreatedProduct(p);
            ncr.setStatus(NonCatalogRequestStatus.CATALOG_PRODUCT_LINKED);
        } else if ("CREATE_PRODUCT".equals(action)) {
            String code = request.productCode() != null && !request.productCode().isBlank()
                    ? request.productCode().trim().toUpperCase()
                    : "PROD-" + Year.now().getValue() + "-" + String.format("%04d", productRepository.count() + 1);

            String sku = request.sku() != null && !request.sku().isBlank()
                    ? request.sku().trim().toUpperCase()
                    : "SKU-" + code;

            Vendor vendor = null;
            if (request.vendorId() != null) {
                vendor = vendorRepository.findById(request.vendorId()).orElse(null);
            }
            if (vendor == null) {
                vendor = vendorRepository.findAll().stream().findFirst().orElse(null);
            }

            Product newProd = Product.builder()
                    .productCode(code)
                    .sku(sku)
                    .productName(ncr.getItemName())
                    .description(ncr.getDescription() != null ? ncr.getDescription() : ncr.getItemName())
                    .brand(request.brand() != null ? request.brand() : "Standard")
                    .manufacturer(request.brand() != null ? request.brand() : "Standard")
                    .category(ncr.getCategory() != null ? ncr.getCategory() : categoryRepository.findAll().stream().findFirst().orElse(null))
                    .vendor(vendor)
                    .unitOfMeasure(ncr.getUnitOfMeasure() != null ? ncr.getUnitOfMeasure() : uomRepository.findAll().stream().findFirst().orElse(null))
                    .unitPrice(request.unitPrice() != null ? request.unitPrice() : (ncr.getEstimatedUnitPrice() != null ? ncr.getEstimatedUnitPrice() : BigDecimal.ZERO))
                    .currency("INR")
                    .minimumStock(5)
                    .maximumStock(100)
                    .reorderLevel(10)
                    .leadTimeDays(7)
                    .taxPercentage(BigDecimal.valueOf(18.00))
                    .active(true)
                    .createdBy(currentUsername())
                    .updatedBy(currentUsername())
                    .build();

            Product savedProd = productRepository.save(newProd);

            if (request.openingStock() != null && request.openingStock() > 0) {
                transactionService.adjustStock(new InventoryAdjustmentRequest(
                        savedProd.getId(), null, BigDecimal.valueOf(request.openingStock()),
                        "OPENING_STOCK", savedProd.getUnitPrice(), "Opening stock created via Non-Catalog Request " + ncr.getRequestNumber()
                ));
            }

            ncr.setCreatedProduct(savedProd);
            ncr.setStatus(NonCatalogRequestStatus.PRODUCT_CREATED);
        } else if ("REJECT".equals(action)) {
            ncr.setStatus(NonCatalogRequestStatus.REJECTED);
        } else {
            throw new ConflictException("Invalid Procurement action: " + action);
        }

        return toResponse(ncrRepository.save(ncr));
    }
}
