package com.procurement.purchaserequest.exception;

import com.procurement.common.exception.ResourceNotFoundException;

public class PurchaseRequestNotFoundException extends ResourceNotFoundException {

    public PurchaseRequestNotFoundException(Long id) {
        super("Purchase request not found: " + id);
    }
}
