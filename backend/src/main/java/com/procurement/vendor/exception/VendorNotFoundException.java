package com.procurement.vendor.exception;

import com.procurement.common.exception.ResourceNotFoundException;

public class VendorNotFoundException extends ResourceNotFoundException {

    public VendorNotFoundException(Long id) {
        super("Vendor not found: " + id);
    }
}
