package com.procurement.warehouse.service;

import com.procurement.common.exception.ConflictException;
import com.procurement.common.response.PageResponse;
import com.procurement.warehouse.dto.request.WarehouseRequest;
import com.procurement.warehouse.dto.response.WarehouseResponse;
import com.procurement.warehouse.entity.Warehouse;
import com.procurement.warehouse.entity.WarehouseType;
import com.procurement.warehouse.exception.WarehouseNotFoundException;
import com.procurement.warehouse.mapper.WarehouseMapper;
import com.procurement.warehouse.repository.WarehouseRepository;
import com.procurement.warehouse.specification.WarehouseSpecification;
import com.procurement.warehouse.validator.WarehouseValidator;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WarehouseServiceImpl implements WarehouseService {

    private final WarehouseRepository warehouseRepository;
    private final WarehouseMapper warehouseMapper;
    private final WarehouseValidator warehouseValidator;

    public WarehouseServiceImpl(WarehouseRepository warehouseRepository,
                                WarehouseMapper warehouseMapper,
                                WarehouseValidator warehouseValidator) {
        this.warehouseRepository = warehouseRepository;
        this.warehouseMapper = warehouseMapper;
        this.warehouseValidator = warehouseValidator;
    }

    @Override
    @Transactional
    public WarehouseResponse create(WarehouseRequest request) {
        warehouseValidator.validate(request);
        ensureUnique(request.warehouseCode(), null);
        Warehouse warehouse = warehouseMapper.toEntity(request);
        applyDefaults(warehouse);
        String username = currentUsername();
        warehouse.setCreatedBy(username);
        warehouse.setUpdatedBy(username);
        return warehouseMapper.toResponse(warehouseRepository.save(warehouse));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<WarehouseResponse> search(String keyword, WarehouseType warehouseType,
                                                  String city, String state, String status,
                                                  Pageable pageable) {
        Page<WarehouseResponse> page = warehouseRepository
                .findAll(WarehouseSpecification.search(keyword, warehouseType, city, state, status), pageable)
                .map(warehouseMapper::toResponse);
        return new PageResponse<>(page.getContent(), page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages(), page.isLast());
    }

    @Override
    @Transactional(readOnly = true)
    public WarehouseResponse getById(Long id) {
        return warehouseMapper.toResponse(findWarehouse(id));
    }

    @Override
    @Transactional
    public WarehouseResponse update(Long id, WarehouseRequest request) {
        warehouseValidator.validate(request);
        Warehouse warehouse = findWarehouse(id);
        ensureUnique(request.warehouseCode(), id);
        warehouseMapper.updateEntity(warehouse, request);
        applyDefaults(warehouse);
        warehouse.setUpdatedBy(currentUsername());
        return warehouseMapper.toResponse(warehouseRepository.save(warehouse));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        warehouseRepository.delete(findWarehouse(id));
    }

    private Warehouse findWarehouse(Long id) {
        return warehouseRepository.findById(id)
                .orElseThrow(() -> new WarehouseNotFoundException(id));
    }

    private void ensureUnique(String warehouseCode, Long currentId) {
        warehouseRepository.findByWarehouseCode(warehouseCode).ifPresent(existing -> {
            if (!existing.getId().equals(currentId)) {
                throw new ConflictException("Warehouse code is already in use");
            }
        });
    }

    private void applyDefaults(Warehouse warehouse) {
        if (warehouse.getStatus() == null || warehouse.getStatus().isBlank()) {
            warehouse.setStatus("ACTIVE");
        } else {
            warehouse.setStatus(warehouse.getStatus().trim().toUpperCase());
        }
    }

    private String currentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication == null ? "system" : authentication.getName();
    }
}
