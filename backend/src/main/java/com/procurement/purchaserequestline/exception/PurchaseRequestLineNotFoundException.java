package com.procurement.purchaserequestline.exception;

import com.procurement.common.exception.ResourceNotFoundException;

public class PurchaseRequestLineNotFoundException extends ResourceNotFoundException {

    public PurchaseRequestLineNotFoundException(Long id) {
        super("Purchase request line not found: " + id);
    }
}
