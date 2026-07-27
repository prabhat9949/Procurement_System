package com.procurement.warehouse.service;

import com.procurement.common.response.PageResponse;
import com.procurement.warehouse.dto.request.WarehouseRequest;
import com.procurement.warehouse.dto.response.WarehouseResponse;
import com.procurement.warehouse.entity.WarehouseType;
import org.springframework.data.domain.Pageable;

public interface WarehouseService {

    WarehouseResponse create(WarehouseRequest request);

    PageResponse<WarehouseResponse> search(String keyword, WarehouseType warehouseType,
                                           String city, String state, String status,
                                           Pageable pageable);

    WarehouseResponse getById(Long id);

    WarehouseResponse update(Long id, WarehouseRequest request);

    void delete(Long id);
}
