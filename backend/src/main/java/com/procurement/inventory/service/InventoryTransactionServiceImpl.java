package com.procurement.inventory.service;

import com.procurement.auditlog.service.AuditLogService;
import com.procurement.common.exception.ConflictException;
import com.procurement.common.exception.ForbiddenException;
import com.procurement.common.exception.ResourceNotFoundException;
import com.procurement.common.response.PageResponse;
import com.procurement.department.entity.Department;
import com.procurement.employee.entity.Employee;
import com.procurement.inventory.dto.request.InventoryAdjustmentRequest;
import com.procurement.inventory.dto.response.InventoryTransactionResponse;
import com.procurement.inventory.entity.Inventory;
import com.procurement.inventory.entity.InventoryTransaction;
import com.procurement.inventory.entity.InventoryTransactionType;
import com.procurement.inventory.repository.InventoryRepository;
import com.procurement.inventory.repository.InventoryTransactionRepository;
import com.procurement.product.entity.Product;
import com.procurement.product.repository.ProductRepository;
import com.procurement.purchaserequest.entity.PurchaseRequest;
import com.procurement.user.entity.User;
import com.procurement.user.repository.UserRepository;
import com.procurement.warehouse.entity.Warehouse;
import com.procurement.warehouse.repository.WarehouseRepository;
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
import java.util.List;
import java.util.Optional;

@Service
public class InventoryTransactionServiceImpl implements InventoryTransactionService {

    private final InventoryTransactionRepository transactionRepository;
    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public InventoryTransactionServiceImpl(
            InventoryTransactionRepository transactionRepository,
            InventoryRepository inventoryRepository,
            ProductRepository productRepository,
            WarehouseRepository warehouseRepository,
            UserRepository userRepository,
            AuditLogService auditLogService) {
        this.transactionRepository = transactionRepository;
        this.inventoryRepository = inventoryRepository;
        this.productRepository = productRepository;
        this.warehouseRepository = warehouseRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    private String currentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth == null ? "system" : auth.getName();
    }

    private Employee currentEmployee() {
        return userRepository.findByUsername(currentUsername())
                .map(User::getEmployee)
                .orElse(null);
    }

    private String nextTransactionNumber() {
        return "ITXN-" + Year.now().getValue() + "-" + String.format("%06d", transactionRepository.count() + 1);
    }

    private String name(Employee e) {
        return e == null ? "System" : e.getFirstName() + " " + (e.getLastName() == null ? "" : e.getLastName());
    }

    private InventoryTransactionResponse toResponse(InventoryTransaction t) {
        return new InventoryTransactionResponse(
                t.getId(),
                t.getTransactionNumber(),
                t.getProduct().getId(),
                t.getProduct().getProductCode(),
                t.getProduct().getProductName(),
                t.getProduct().getSku(),
                t.getWarehouse() == null ? null : t.getWarehouse().getId(),
                t.getWarehouse() == null ? null : t.getWarehouse().getWarehouseName(),
                t.getTransactionType().name(),
                t.getQuantityBefore(),
                t.getQuantityChanged(),
                t.getQuantityAfter(),
                t.getUnitCost(),
                t.getTotalValue(),
                t.getReferenceType(),
                t.getReferenceId(),
                t.getReferenceNumber(),
                t.getPerformedBy() == null ? null : t.getPerformedBy().getId(),
                name(t.getPerformedBy()),
                name(t.getRequester()),
                t.getDepartment() == null ? null : t.getDepartment().getDepartmentName(),
                t.getReason(),
                t.getActorUsername(),
                t.getCreatedAt()
        );
    }

    @Override
    @Transactional
    public InventoryTransaction recordTransaction(
            Product product,
            Warehouse warehouse,
            InventoryTransactionType type,
            BigDecimal quantityBefore,
            BigDecimal quantityChanged,
            BigDecimal quantityAfter,
            BigDecimal unitCost,
            String referenceType,
            Long referenceId,
            String referenceNumber,
            Employee requester,
            Department department,
            String reason
    ) {
        Employee actor = currentEmployee();
        String username = currentUsername();
        BigDecimal cost = unitCost != null ? unitCost : (product.getUnitPrice() != null ? product.getUnitPrice() : BigDecimal.ZERO);
        BigDecimal totalVal = cost.multiply(quantityChanged.abs());

        InventoryTransaction txn = InventoryTransaction.builder()
                .transactionNumber(nextTransactionNumber())
                .product(product)
                .warehouse(warehouse)
                .transactionType(type)
                .quantityBefore(quantityBefore)
                .quantityChanged(quantityChanged)
                .quantityAfter(quantityAfter)
                .unitCost(cost)
                .totalValue(totalVal)
                .referenceType(referenceType)
                .referenceId(referenceId)
                .referenceNumber(referenceNumber)
                .performedBy(actor)
                .requester(requester)
                .department(department)
                .reason(reason)
                .actorUsername(username)
                .createdAt(LocalDateTime.now())
                .build();

        InventoryTransaction saved = transactionRepository.save(txn);
        auditLogService.record("INVENTORY", "InventoryTransaction", saved.getId(), type.name(),
                referenceNumber != null ? referenceNumber : product.getProductCode(), "INVENTORY", true,
                quantityBefore.toPlainString(), quantityAfter.toPlainString(),
                reason != null ? reason : "Inventory transaction " + type.name());

        return saved;
    }

    @Override
    @Transactional
    public InventoryTransactionResponse adjustStock(InventoryAdjustmentRequest request) {
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + request.productId()));

        InventoryTransactionType type;
        try {
            type = InventoryTransactionType.valueOf(request.transactionType().trim().toUpperCase());
        } catch (Exception e) {
            type = InventoryTransactionType.STOCK_ADJUSTMENT;
        }

        BigDecimal qtyChange = request.quantityChanged();

        // Digital Software License check
        if (Boolean.TRUE.equals(product.getIsDigital())) {
            int currentTotal = product.getTotalLicenses() != null ? product.getTotalLicenses() : 0;
            int currentAllocated = product.getAllocatedLicenses() != null ? product.getAllocatedLicenses() : 0;
            BigDecimal before = BigDecimal.valueOf(currentTotal - currentAllocated);
            int newTotal = currentTotal + qtyChange.intValue();
            if (newTotal < currentAllocated) {
                throw new ConflictException("Cannot reduce total licenses below currently allocated count (" + currentAllocated + ")");
            }
            product.setTotalLicenses(newTotal);
            productRepository.save(product);
            BigDecimal after = BigDecimal.valueOf(newTotal - currentAllocated);

            InventoryTransaction txn = recordTransaction(
                    product, null, type, before, qtyChange, after,
                    request.unitCost(), "MANUAL", product.getId(), product.getProductCode(),
                    null, null, request.reason()
            );
            return toResponse(txn);
        }

        // Physical Warehouse Stock
        Warehouse warehouse = null;
        if (request.warehouseId() != null) {
            warehouse = warehouseRepository.findById(request.warehouseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found: " + request.warehouseId()));
        } else {
            warehouse = warehouseRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new ConflictException("No warehouse configured"));
        }

        Optional<Inventory> invOpt = inventoryRepository.findByProductIdAndWarehouseId(product.getId(), warehouse.getId());
        Inventory inventory;
        BigDecimal beforeAvailable;
        if (invOpt.isPresent()) {
            inventory = invOpt.get();
            beforeAvailable = inventory.getAvailableQuantity() != null ? inventory.getAvailableQuantity() : BigDecimal.ZERO;
        } else {
            inventory = Inventory.builder()
                    .product(product)
                    .warehouse(warehouse)
                    .availableQuantity(BigDecimal.ZERO)
                    .reservedQuantity(BigDecimal.ZERO)
                    .damagedQuantity(BigDecimal.ZERO)
                    .minimumStock(product.getMinimumStock() != null ? BigDecimal.valueOf(product.getMinimumStock()) : BigDecimal.ZERO)
                    .maximumStock(product.getMaximumStock() != null ? BigDecimal.valueOf(product.getMaximumStock()) : BigDecimal.valueOf(100))
                    .reorderLevel(product.getReorderLevel() != null ? BigDecimal.valueOf(product.getReorderLevel()) : BigDecimal.TEN)
                    .averageUnitCost(product.getUnitPrice() != null ? product.getUnitPrice() : BigDecimal.ZERO)
                    .inventoryValue(BigDecimal.ZERO)
                    .status("ACTIVE")
                    .build();
            beforeAvailable = BigDecimal.ZERO;
        }

        BigDecimal afterAvailable = beforeAvailable.add(qtyChange);
        if (afterAvailable.compareTo(BigDecimal.ZERO) < 0) {
            throw new ConflictException("Inventory cannot be reduced below zero. Current available: " + beforeAvailable);
        }

        inventory.setAvailableQuantity(afterAvailable);
        inventory.setInventoryValue(afterAvailable.multiply(inventory.getAverageUnitCost() != null ? inventory.getAverageUnitCost() : BigDecimal.ZERO));
        inventory.setLastStockUpdate(LocalDateTime.now());
        inventory.setUpdatedBy(currentUsername());
        inventoryRepository.save(inventory);

        InventoryTransaction txn = recordTransaction(
                product, warehouse, type, beforeAvailable, qtyChange, afterAvailable,
                request.unitCost() != null ? request.unitCost() : inventory.getAverageUnitCost(),
                "MANUAL", product.getId(), product.getProductCode(),
                null, null, request.reason()
        );

        return toResponse(txn);
    }

    @Override
    @Transactional
    public void allocateStock(Product product, Warehouse warehouse, BigDecimal quantity, PurchaseRequest pr, Employee requester, String reason) {
        if (Boolean.TRUE.equals(product.getIsDigital())) {
            int currentTotal = product.getTotalLicenses() != null ? product.getTotalLicenses() : 0;
            int currentAllocated = product.getAllocatedLicenses() != null ? product.getAllocatedLicenses() : 0;
            int available = currentTotal - currentAllocated;
            if (available < quantity.intValue()) {
                throw new ConflictException("Insufficient software licenses available. Available: " + available + ", Requested: " + quantity);
            }
            product.setAllocatedLicenses(currentAllocated + quantity.intValue());
            productRepository.save(product);

            recordTransaction(
                    product, null, InventoryTransactionType.INTERNAL_ALLOCATION,
                    BigDecimal.valueOf(available), quantity.negate(), BigDecimal.valueOf(available - quantity.intValue()),
                    product.getUnitPrice(), "PR", pr.getId(), pr.getRequestNumber(),
                    requester, pr.getDepartment(), reason
            );
            return;
        }

        // Physical inventory
        if (warehouse == null) {
            warehouse = warehouseRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new ConflictException("No warehouse found for physical stock allocation"));
        }

        final Warehouse effectiveWarehouse = warehouse;
        Inventory inventory = inventoryRepository.findByProductIdAndWarehouseId(product.getId(), effectiveWarehouse.getId())
                .orElseThrow(() -> new ConflictException("No inventory record found for product " + product.getProductName() + " in warehouse " + effectiveWarehouse.getWarehouseName()));

        BigDecimal available = inventory.getAvailableQuantity() != null ? inventory.getAvailableQuantity() : BigDecimal.ZERO;
        BigDecimal reserved = inventory.getReservedQuantity() != null ? inventory.getReservedQuantity() : BigDecimal.ZERO;
        BigDecimal effectiveAvailable = available.subtract(reserved);

        if (effectiveAvailable.compareTo(quantity) < 0) {
            throw new ConflictException("Insufficient unreserved stock. Available: " + effectiveAvailable + ", Requested: " + quantity);
        }

        inventory.setAvailableQuantity(available.subtract(quantity));
        inventory.setReservedQuantity(reserved.add(quantity));
        inventory.setLastStockUpdate(LocalDateTime.now());
        inventoryRepository.save(inventory);

        recordTransaction(
                product, warehouse, InventoryTransactionType.INTERNAL_ALLOCATION,
                available, quantity.negate(), available.subtract(quantity),
                inventory.getAverageUnitCost(), "PR", pr.getId(), pr.getRequestNumber(),
                requester, pr.getDepartment(), reason
        );
    }

    @Override
    @Transactional
    public void releaseAllocation(Product product, Warehouse warehouse, BigDecimal quantity, PurchaseRequest pr, String reason) {
        if (Boolean.TRUE.equals(product.getIsDigital())) {
            int currentAllocated = product.getAllocatedLicenses() != null ? product.getAllocatedLicenses() : 0;
            int newAllocated = Math.max(0, currentAllocated - quantity.intValue());
            product.setAllocatedLicenses(newAllocated);
            productRepository.save(product);

            int total = product.getTotalLicenses() != null ? product.getTotalLicenses() : 0;
            recordTransaction(
                    product, null, InventoryTransactionType.INTERNAL_REVERSAL,
                    BigDecimal.valueOf(total - currentAllocated), quantity, BigDecimal.valueOf(total - newAllocated),
                    product.getUnitPrice(), "PR", pr.getId(), pr.getRequestNumber(),
                    pr.getRequester(), pr.getDepartment(), reason
            );
            return;
        }

        if (warehouse == null) {
            warehouse = warehouseRepository.findAll().stream().findFirst().orElse(null);
        }
        if (warehouse == null) return;

        Optional<Inventory> invOpt = inventoryRepository.findByProductIdAndWarehouseId(product.getId(), warehouse.getId());
        if (invOpt.isEmpty()) return;

        Inventory inventory = invOpt.get();
        BigDecimal available = inventory.getAvailableQuantity() != null ? inventory.getAvailableQuantity() : BigDecimal.ZERO;
        BigDecimal reserved = inventory.getReservedQuantity() != null ? inventory.getReservedQuantity() : BigDecimal.ZERO;

        BigDecimal newReserved = reserved.subtract(quantity).max(BigDecimal.ZERO);
        BigDecimal newAvailable = available.add(quantity);

        inventory.setAvailableQuantity(newAvailable);
        inventory.setReservedQuantity(newReserved);
        inventory.setLastStockUpdate(LocalDateTime.now());
        inventoryRepository.save(inventory);

        recordTransaction(
                product, warehouse, InventoryTransactionType.INTERNAL_REVERSAL,
                available, quantity, newAvailable,
                inventory.getAverageUnitCost(), "PR", pr.getId(), pr.getRequestNumber(),
                pr.getRequester(), pr.getDepartment(), reason
        );
    }

    @Override
    @Transactional
    public void issueStock(Product product, Warehouse warehouse, BigDecimal quantity, PurchaseRequest pr, Employee requester, String reason) {
        if (Boolean.TRUE.equals(product.getIsDigital())) {
            // Already allocated, digital issue marks handover
            recordTransaction(
                    product, null, InventoryTransactionType.INTERNAL_ISSUE,
                    BigDecimal.valueOf(product.getTotalLicenses() - product.getAllocatedLicenses()), BigDecimal.ZERO,
                    BigDecimal.valueOf(product.getTotalLicenses() - product.getAllocatedLicenses()),
                    product.getUnitPrice(), "PR", pr.getId(), pr.getRequestNumber(),
                    requester, pr.getDepartment(), reason
            );
            return;
        }

        if (warehouse == null) {
            warehouse = warehouseRepository.findAll().stream().findFirst().orElse(null);
        }
        if (warehouse == null) return;

        Optional<Inventory> invOpt = inventoryRepository.findByProductIdAndWarehouseId(product.getId(), warehouse.getId());
        if (invOpt.isEmpty()) return;

        Inventory inventory = invOpt.get();
        BigDecimal reserved = inventory.getReservedQuantity() != null ? inventory.getReservedQuantity() : BigDecimal.ZERO;
        inventory.setReservedQuantity(reserved.subtract(quantity).max(BigDecimal.ZERO));
        inventory.setLastStockUpdate(LocalDateTime.now());
        inventoryRepository.save(inventory);

        recordTransaction(
                product, warehouse, InventoryTransactionType.INTERNAL_ISSUE,
                inventory.getAvailableQuantity(), quantity.negate(), inventory.getAvailableQuantity(),
                inventory.getAverageUnitCost(), "PR", pr.getId(), pr.getRequestNumber(),
                requester, pr.getDepartment(), reason
        );
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<InventoryTransactionResponse> search(Long productId, Long warehouseId, String transactionType, String referenceNumber, Pageable pageable) {
        Specification<InventoryTransaction> spec = (root, query, cb) -> cb.conjunction();
        if (productId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("product").get("id"), productId));
        }
        if (warehouseId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("warehouse").get("id"), warehouseId));
        }
        if (transactionType != null && !transactionType.isBlank()) {
            try {
                InventoryTransactionType type = InventoryTransactionType.valueOf(transactionType.trim().toUpperCase());
                spec = spec.and((root, query, cb) -> cb.equal(root.get("transactionType"), type));
            } catch (Exception ignored) {}
        }
        if (referenceNumber != null && !referenceNumber.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("referenceNumber")), "%" + referenceNumber.trim().toLowerCase() + "%"));
        }

        Page<InventoryTransactionResponse> page = transactionRepository.findAll(spec, pageable).map(this::toResponse);
        return new PageResponse<>(page.getContent(), page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages(), page.isLast());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryTransactionResponse> getByProduct(Long productId) {
        return transactionRepository.findByProductIdOrderByCreatedAtDesc(productId).stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryTransactionResponse> getByReference(String referenceNumber) {
        return transactionRepository.findByReferenceNumberOrderByCreatedAtAsc(referenceNumber).stream().map(this::toResponse).toList();
    }
}
