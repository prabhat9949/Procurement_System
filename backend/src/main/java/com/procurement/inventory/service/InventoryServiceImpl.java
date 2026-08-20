package com.procurement.inventory.service;

import com.procurement.common.exception.ConflictException;
import com.procurement.common.exception.ResourceNotFoundException;
import com.procurement.common.response.PageResponse;
import com.procurement.inventory.dto.request.InventoryRequest;
import com.procurement.inventory.dto.response.InventoryResponse;
import com.procurement.inventory.entity.Inventory;
import com.procurement.inventory.exception.InventoryNotFoundException;
import com.procurement.inventory.mapper.InventoryMapper;
import com.procurement.inventory.repository.InventoryRepository;
import com.procurement.inventory.specification.InventorySpecification;
import com.procurement.inventory.validator.InventoryValidator;
import com.procurement.product.entity.Product;
import com.procurement.product.repository.ProductRepository;
import com.procurement.warehouse.entity.Warehouse;
import com.procurement.warehouse.repository.WarehouseRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final InventoryMapper inventoryMapper;
    private final InventoryValidator inventoryValidator;

    public InventoryServiceImpl(InventoryRepository inventoryRepository,
                                ProductRepository productRepository,
                                WarehouseRepository warehouseRepository,
                                InventoryMapper inventoryMapper,
                                InventoryValidator inventoryValidator) {
        this.inventoryRepository = inventoryRepository;
        this.productRepository = productRepository;
        this.warehouseRepository = warehouseRepository;
        this.inventoryMapper = inventoryMapper;
        this.inventoryValidator = inventoryValidator;
    }

    @Override
    @Transactional
    public InventoryResponse create(InventoryRequest request) {
        inventoryValidator.validate(request);
        ensureUnique(request.productId(), request.warehouseId(), null);
        Inventory inventory = inventoryMapper.toEntity(request, findProduct(request.productId()),
                findWarehouse(request.warehouseId()));
        applyDefaults(inventory);
        String username = currentUsername();
        inventory.setCreatedBy(username);
        inventory.setUpdatedBy(username);
        return inventoryMapper.toResponse(inventoryRepository.save(inventory));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<InventoryResponse> search(String keyword, Long productId, Long warehouseId,
                                                  Long categoryId, String status, Boolean lowStock,
                                                  Boolean outOfStock, Pageable pageable) {
        Page<InventoryResponse> page = inventoryRepository.findAll(
                        InventorySpecification.search(keyword, productId, warehouseId, categoryId,
                                status, lowStock, outOfStock), pageable)
                .map(inventoryMapper::toResponse);
        return new PageResponse<>(page.getContent(), page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages(), page.isLast());
    }

    @Override
    @Transactional(readOnly = true)
    public InventoryResponse getById(Long id) {
        return inventoryMapper.toResponse(findInventory(id));
    }

    @Override
    @Transactional
    public InventoryResponse update(Long id, InventoryRequest request) {
        inventoryValidator.validate(request);
        Inventory inventory = findInventory(id);
        ensureUnique(request.productId(), request.warehouseId(), id);
        inventoryMapper.updateEntity(inventory, request, findProduct(request.productId()),
                findWarehouse(request.warehouseId()));
        applyDefaults(inventory);
        inventory.setUpdatedBy(currentUsername());
        return inventoryMapper.toResponse(inventoryRepository.save(inventory));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        inventoryRepository.delete(findInventory(id));
    }

    private Inventory findInventory(Long id) {
        return inventoryRepository.findById(id)
                .orElseThrow(() -> new InventoryNotFoundException(id));
    }

    private Product findProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
    }

    private Warehouse findWarehouse(Long id) {
        return warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found: " + id));
    }

    private void ensureUnique(Long productId, Long warehouseId, Long currentId) {
        inventoryRepository.findByProductIdAndWarehouseId(productId, warehouseId)
                .ifPresent(existing -> {
                    if (!existing.getId().equals(currentId)) {
                        throw new ConflictException("Inventory already exists for this product and warehouse");
                    }
                });
    }

    private void applyDefaults(Inventory inventory) {
        if (inventory.getStatus() == null || inventory.getStatus().isBlank()) {
            inventory.setStatus("ACTIVE");
        } else {
            inventory.setStatus(inventory.getStatus().trim().toUpperCase());
        }
    }

    private String currentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication == null ? "system" : authentication.getName();
    }
}
