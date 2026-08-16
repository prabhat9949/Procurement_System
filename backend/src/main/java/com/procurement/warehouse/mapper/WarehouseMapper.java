package com.procurement.warehouse.mapper;

import com.procurement.warehouse.dto.request.WarehouseRequest;
import com.procurement.warehouse.dto.response.WarehouseResponse;
import com.procurement.warehouse.entity.Warehouse;
import org.springframework.stereotype.Component;

@Component
public class WarehouseMapper {

    public Warehouse toEntity(WarehouseRequest request) {
        Warehouse warehouse = new Warehouse();
        updateEntity(warehouse, request);
        return warehouse;
    }

    public void updateEntity(Warehouse warehouse, WarehouseRequest request) {
        warehouse.setWarehouseCode(request.warehouseCode());
        warehouse.setWarehouseName(request.warehouseName());
        warehouse.setDescription(request.description());
        warehouse.setWarehouseType(request.warehouseType());
        warehouse.setStatus(request.status());
        warehouse.setManagerName(request.managerName());
        warehouse.setContactPerson(request.contactPerson());
        warehouse.setEmail(request.email());
        warehouse.setPhone(request.phone());
        warehouse.setAddressLine1(request.addressLine1());
        warehouse.setAddressLine2(request.addressLine2());
        warehouse.setCity(request.city());
        warehouse.setState(request.state());
        warehouse.setCountry(request.country());
        warehouse.setPostalCode(request.postalCode());
        warehouse.setStorageCapacity(request.storageCapacity());
    }

    public WarehouseResponse toResponse(Warehouse warehouse) {
        return new WarehouseResponse(
                warehouse.getId(), warehouse.getWarehouseCode(), warehouse.getWarehouseName(),
                warehouse.getDescription(), warehouse.getWarehouseType(), warehouse.getStatus(),
                warehouse.getManagerName(), warehouse.getContactPerson(), warehouse.getEmail(),
                warehouse.getPhone(), warehouse.getAddressLine1(), warehouse.getAddressLine2(),
                warehouse.getCity(), warehouse.getState(), warehouse.getCountry(),
                warehouse.getPostalCode(), warehouse.getStorageCapacity(), warehouse.getCreatedBy(),
                warehouse.getUpdatedBy(), warehouse.getCreatedAt(), warehouse.getUpdatedAt());
    }
}
