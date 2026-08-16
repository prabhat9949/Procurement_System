package com.procurement.inventory.mapper;

import com.procurement.inventory.dto.request.InventoryRequest;
import com.procurement.inventory.dto.response.InventoryResponse;
import com.procurement.inventory.entity.Inventory;
import com.procurement.product.entity.Product;
import com.procurement.warehouse.entity.Warehouse;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class InventoryMapper {

    public Inventory toEntity(InventoryRequest request, Product product, Warehouse warehouse) {
        Inventory inventory = new Inventory();
        updateEntity(inventory, request, product, warehouse);
        return inventory;
    }

    public void updateEntity(Inventory inventory, InventoryRequest request,
                             Product product, Warehouse warehouse) {
        inventory.setProduct(product);
        inventory.setWarehouse(warehouse);
        inventory.setAvailableQuantity(request.availableQuantity());
        inventory.setReservedQuantity(request.reservedQuantity());
        inventory.setDamagedQuantity(request.damagedQuantity());
        inventory.setMinimumStock(request.minimumStock());
        inventory.setMaximumStock(request.maximumStock());
        inventory.setReorderLevel(request.reorderLevel());
        inventory.setAverageUnitCost(request.averageUnitCost());
        inventory.setInventoryValue(request.availableQuantity().multiply(request.averageUnitCost()));
        inventory.setLastStockUpdate(java.time.LocalDateTime.now());
        inventory.setStatus(request.status());
    }

    public InventoryResponse toResponse(Inventory inventory) {
        return new InventoryResponse(
                inventory.getId(), inventory.getProduct().getId(), inventory.getProduct().getProductCode(),
                inventory.getProduct().getProductName(), inventory.getWarehouse().getId(),
                inventory.getWarehouse().getWarehouseCode(), inventory.getWarehouse().getWarehouseName(),
                inventory.getAvailableQuantity(), inventory.getReservedQuantity(),
                inventory.getDamagedQuantity(), inventory.getMinimumStock(), inventory.getMaximumStock(),
                inventory.getReorderLevel(), inventory.getAverageUnitCost(), inventory.getInventoryValue(),
                inventory.getLastStockUpdate(), inventory.getStatus(), inventory.getCreatedBy(),
                inventory.getUpdatedBy(), inventory.getCreatedAt(), inventory.getUpdatedAt());
    }
}
