package com.procurement.inventory.exception;

import com.procurement.common.exception.ResourceNotFoundException;

public class InventoryNotFoundException extends ResourceNotFoundException {

    public InventoryNotFoundException(Long id) {
        super("Inventory record not found: " + id);
    }
}
