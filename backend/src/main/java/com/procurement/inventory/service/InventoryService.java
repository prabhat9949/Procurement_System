package com.procurement.inventory.service;

import com.procurement.common.response.PageResponse;
import com.procurement.inventory.dto.request.InventoryRequest;
import com.procurement.inventory.dto.response.InventoryResponse;
import org.springframework.data.domain.Pageable;

public interface InventoryService {

    InventoryResponse create(InventoryRequest request);

    PageResponse<InventoryResponse> search(String keyword, Long productId, Long warehouseId,
                                           Long categoryId, String status, Boolean lowStock,
                                           Boolean outOfStock, Pageable pageable);

    InventoryResponse getById(Long id);

    InventoryResponse update(Long id, InventoryRequest request);

    void delete(Long id);
}
