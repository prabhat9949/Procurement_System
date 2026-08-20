package com.procurement.inventory.entity;

public enum InventoryTransactionType {
    OPENING_STOCK,
    RESTOCK,
    INTERNAL_ALLOCATION,
    INTERNAL_ISSUE,
    INTERNAL_REVERSAL,
    STOCK_ADJUSTMENT,
    GRN_RECEIPT,
    RETURN_TO_STOCK,
    DAMAGED_WRITE_OFF
}
