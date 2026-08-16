package com.procurement.warehouse.exception;

import com.procurement.common.exception.ResourceNotFoundException;

public class WarehouseNotFoundException extends ResourceNotFoundException {

    public WarehouseNotFoundException(Long id) {
        super("Warehouse not found: " + id);
    }
}
